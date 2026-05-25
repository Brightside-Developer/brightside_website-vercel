-- ============================================================
-- Brightside Finance — DB Migration v2  (safe to re-run)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Ensure game_state exists with the correct schema ──────
CREATE TABLE IF NOT EXISTS public.game_state (
  uid         UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cash        NUMERIC NOT NULL DEFAULT 100000,
  holdings    JSONB   NOT NULL DEFAULT '{}',
  total_value NUMERIC NOT NULL DEFAULT 100000,
  updated_at  TIMESTAMPTZ      DEFAULT NOW()
);

-- If the table already existed, add any missing columns safely
ALTER TABLE public.game_state
  ADD COLUMN IF NOT EXISTS total_value NUMERIC NOT NULL DEFAULT 100000,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- Make sure RLS is on and users can manage only their own row
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own game state" ON public.game_state;
CREATE POLICY "Users manage own game state"
  ON public.game_state FOR ALL USING (auth.uid() = uid);

-- Back-fill total_value from cash for existing rows that still sit at default
UPDATE public.game_state
SET total_value = cash
WHERE total_value = 100000 AND cash != 100000;

-- ── 2. Expand stocks with fundamental data ───────────────────
ALTER TABLE public.stocks
  ADD COLUMN IF NOT EXISTS market_cap      NUMERIC,
  ADD COLUMN IF NOT EXISTS pe_ratio        NUMERIC,
  ADD COLUMN IF NOT EXISTS revenue_growth  NUMERIC,
  ADD COLUMN IF NOT EXISTS avg_daily_chg   NUMERIC,
  ADD COLUMN IF NOT EXISTS open_price      NUMERIC,
  ADD COLUMN IF NOT EXISTS close_price     NUMERIC;

-- ── 3. Competitions ──────────────────────────────────────────
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

-- ── 4. Competition portfolios ────────────────────────────────
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

-- ── 5. Leaderboard functions ─────────────────────────────────
-- Using plpgsql so the body is not type-checked at creation time.

CREATE OR REPLACE FUNCTION public.get_main_leaderboard()
RETURNS TABLE(
  uid          UUID,
  display_name TEXT,
  photo_url    TEXT,
  total_value  NUMERIC,
  return_pct   NUMERIC,
  updated_at   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.uid,
    COALESCE(p.full_name, 'Player')::TEXT      AS display_name,
    p.photo_url::TEXT,
    g.total_value,
    ROUND(((g.total_value - 100000.0) / 100000.0 * 100.0)::NUMERIC, 2) AS return_pct,
    g.updated_at
  FROM   public.game_state g
  LEFT JOIN public.profiles p ON p.id = g.uid
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.uid,
    COALESCE(p.full_name, 'Player')::TEXT      AS display_name,
    p.photo_url::TEXT,
    cp.total_value,
    ROUND(((cp.total_value - c.starting_cash) / c.starting_cash * 100.0)::NUMERIC, 2) AS return_pct,
    cp.enrolled_at,
    cp.updated_at
  FROM   public.competition_portfolios cp
  JOIN   public.competitions           c  ON c.id   = cp.competition_id
  LEFT JOIN public.profiles            p  ON p.id   = cp.uid
  WHERE  cp.competition_id = comp_id
  ORDER  BY cp.total_value DESC
  LIMIT  100;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_main_leaderboard()               TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_competition_leaderboard(INTEGER) TO anon, authenticated;

-- ── 6. Seed Summer 2026 competition ──────────────────────────
INSERT INTO public.competitions
  (name, description, start_date, end_date, starting_cash, is_enrolling, prize_info)
VALUES (
  'Summer 2026 Trading Challenge',
  'Compete against other Brightside members in our first official 3-month trading competition. Start with $100,000 in virtual cash — the top portfolios win.',
  '2026-06-14',
  '2026-09-14',
  100000,
  true,
  'Top 3 finishers earn recognition on the Brightside leaderboard'
)
ON CONFLICT DO NOTHING;
