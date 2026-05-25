-- ============================================================
-- Brightside Finance — Master Schema  (safe to re-run)
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- REQUIRED tables (6 total):
--   auth.users          — Supabase built-in, do not touch
--   public.profiles     — user display info
--   public.stocks       — live market data (Python updater writes here)
--   public.stock_history — JSONB price history per symbol
--   public.game_state   — main game portfolio per user
--   public.competitions — competition definitions
--   public.competition_portfolios — per-user competition portfolios
--
-- ANYTHING ELSE in public.* that is not in this list is safe to drop
-- after verifying it is not referenced elsewhere.
-- ============================================================

-- ── 1. profiles ───────────────────────────────────────────────
-- Supabase Auth creates auth.users automatically.
-- profiles is a separate public table linked by UUID.
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT,
  photo_url  TEXT,
  dob        DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users read own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 2. stocks ─────────────────────────────────────────────────
-- Written by scripts/update_prices.py every few seconds.
-- Public read-only. Only the service role writes.
CREATE TABLE IF NOT EXISTS public.stocks (
  symbol          TEXT PRIMARY KEY,
  name            TEXT,
  price           NUMERIC,
  change          NUMERIC,
  "changePercent" NUMERIC,
  volume          BIGINT,
  "dayHigh"       NUMERIC,
  "dayLow"        NUMERIC,
  high52w         NUMERIC,
  low52w          NUMERIC,
  bid             NUMERIC,
  ask             NUMERIC,
  market_cap      NUMERIC,
  pe_ratio        NUMERIC,
  revenue_growth  NUMERIC,
  avg_daily_chg   NUMERIC,
  open_price      NUMERIC,
  close_price     NUMERIC,
  "updatedAt"     TIMESTAMPTZ DEFAULT NOW()
);

-- Add any columns that may be missing from older installs
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS market_cap      NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS pe_ratio        NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS revenue_growth  NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS avg_daily_chg   NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS open_price      NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS close_price     NUMERIC;

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stocks" ON public.stocks;
CREATE POLICY "Public read stocks"
  ON public.stocks FOR SELECT USING (true);

-- ── 3. stock_history ──────────────────────────────────────────
-- One row per symbol. `prices` is a JSONB array of {date, price} objects.
-- Written by update_prices.py once per day after market close.
CREATE TABLE IF NOT EXISTS public.stock_history (
  symbol    TEXT PRIMARY KEY,
  prices    JSONB NOT NULL DEFAULT '[]',
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stock_history" ON public.stock_history;
CREATE POLICY "Public read stock_history"
  ON public.stock_history FOR SELECT USING (true);

-- ── 4. game_state ─────────────────────────────────────────────
-- Main game portfolio. One row per user, auto-created on first login.
-- Holdings JSONB stores both long positions and shorts (SHORT:SYMBOL keys).
CREATE TABLE IF NOT EXISTS public.game_state (
  uid         UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cash        NUMERIC NOT NULL DEFAULT 100000,
  holdings    JSONB   NOT NULL DEFAULT '{}',
  total_value NUMERIC NOT NULL DEFAULT 100000,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.game_state ADD COLUMN IF NOT EXISTS total_value NUMERIC NOT NULL DEFAULT 100000;
ALTER TABLE public.game_state ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own game state" ON public.game_state;
CREATE POLICY "Users manage own game state"
  ON public.game_state FOR ALL USING (auth.uid() = uid);

-- ── 5. competitions ───────────────────────────────────────────
-- Competition definitions. Admin inserts rows; users read.
CREATE TABLE IF NOT EXISTS public.competitions (
  id            SERIAL      PRIMARY KEY,
  name          TEXT        NOT NULL,
  description   TEXT,
  start_date    DATE        NOT NULL,
  end_date      DATE        NOT NULL,
  starting_cash NUMERIC     NOT NULL DEFAULT 100000,
  is_enrolling  BOOLEAN     DEFAULT true,
  prize_info    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read competitions" ON public.competitions;
CREATE POLICY "Public read competitions"
  ON public.competitions FOR SELECT USING (true);

-- ── 6. competition_portfolios ─────────────────────────────────
-- Per-user per-competition portfolios.
-- Holdings JSONB same format as game_state (includes SHORT: keys).
CREATE TABLE IF NOT EXISTS public.competition_portfolios (
  uid            UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id INTEGER NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  cash           NUMERIC NOT NULL DEFAULT 100000,
  holdings       JSONB   NOT NULL DEFAULT '{}',
  total_value    NUMERIC NOT NULL DEFAULT 100000,
  enrolled_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (uid, competition_id)
);
ALTER TABLE public.competition_portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads competition portfolios" ON public.competition_portfolios;
DROP POLICY IF EXISTS "Users insert own comp portfolio"     ON public.competition_portfolios;
DROP POLICY IF EXISTS "Users update own comp portfolio"     ON public.competition_portfolios;
CREATE POLICY "Anyone reads competition portfolios"
  ON public.competition_portfolios FOR SELECT USING (true);
CREATE POLICY "Users insert own comp portfolio"
  ON public.competition_portfolios FOR INSERT WITH CHECK (auth.uid() = uid);
CREATE POLICY "Users update own comp portfolio"
  ON public.competition_portfolios FOR UPDATE USING (auth.uid() = uid);

-- ── 7. Leaderboard RPC functions ──────────────────────────────
CREATE OR REPLACE FUNCTION public.get_main_leaderboard()
RETURNS TABLE(
  uid          UUID,
  display_name TEXT,
  photo_url    TEXT,
  total_value  NUMERIC,
  return_pct   NUMERIC,
  updated_at   TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.uid,
    COALESCE(
      NULLIF(TRIM(p.full_name), ''),
      NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(au.raw_user_meta_data->>'name'), ''),
      'Anonymous'
    )::TEXT,
    p.photo_url::TEXT,
    g.total_value,
    ROUND(((g.total_value - 100000.0) / 100000.0 * 100.0)::NUMERIC, 2),
    g.updated_at
  FROM   public.game_state g
  LEFT JOIN public.profiles p  ON p.id  = g.uid
  LEFT JOIN auth.users      au ON au.id = g.uid
  ORDER  BY g.total_value DESC
  LIMIT  100;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_competition_leaderboard(comp_id INTEGER)
RETURNS TABLE(
  uid          UUID,
  display_name TEXT,
  photo_url    TEXT,
  total_value  NUMERIC,
  return_pct   NUMERIC,
  enrolled_at  TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.uid,
    COALESCE(
      NULLIF(TRIM(p.full_name), ''),
      NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(au.raw_user_meta_data->>'name'), ''),
      'Anonymous'
    )::TEXT,
    p.photo_url::TEXT,
    cp.total_value,
    ROUND(((cp.total_value - c.starting_cash) / c.starting_cash * 100.0)::NUMERIC, 2),
    cp.enrolled_at,
    cp.updated_at
  FROM   public.competition_portfolios cp
  JOIN   public.competitions           c  ON c.id   = cp.competition_id
  LEFT JOIN public.profiles            p  ON p.id  = cp.uid
  LEFT JOIN auth.users                 au ON au.id = cp.uid
  WHERE  cp.competition_id = comp_id
  ORDER  BY cp.total_value DESC
  LIMIT  100;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_main_leaderboard()               TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_competition_leaderboard(INTEGER) TO anon, authenticated;

-- ── 8. Realtime — enable for live-updating tables ─────────────
-- Run these only if stocks / game_state are not already in the
-- supabase_realtime publication (check with schema_audit.sql first).
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.stocks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;

-- ── 9. Seed Summer 2026 competition (skips if already exists) ─
INSERT INTO public.competitions
  (name, description, start_date, end_date, starting_cash, is_enrolling, prize_info)
VALUES (
  'Summer 2026 Trading Challenge',
  'Compete against other Brightside members in our first official 3-month trading competition. Start with $100,000 in virtual cash — the top portfolios win.',
  '2026-06-14', '2026-09-14', 100000, true,
  'Top 3 finishers earn recognition on the Brightside leaderboard'
)
ON CONFLICT DO NOTHING;
