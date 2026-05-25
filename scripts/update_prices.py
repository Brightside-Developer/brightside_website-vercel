import yfinance as yf
from supabase import create_client, Client
import pandas as pd
import requests
import time
import os
import sys
import io
import pytz
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Connected to Supabase.")

# ── Tuning constants ───────────────────────────────────────────────────────────
PRICE_BATCH        = 100
FUND_BATCH         = 15
MARKET_SLEEP       = 8    # seconds between batches → ~10 min full pass
CLOSED_SLEEP       = 30
FUND_SLEEP         = 4
FUND_INTERVAL_SEC  = 4 * 3600
MAX_HISTORY_POINTS = 365 * 5

# ── Shared state ───────────────────────────────────────────────────────────────
history_written_today  = False
current_date_str       = ""
last_fundamentals_time = 0.0


def safe_float(value, fallback=0.0):
    try:
        v = float(value)
        return fallback if pd.isna(v) else round(v, 4)
    except (TypeError, ValueError):
        return fallback


def is_market_open():
    cst = pytz.timezone("US/Central")
    now = datetime.now(cst)
    if now.weekday() >= 5:
        return False
    return datetime.strptime("08:30", "%H:%M").time() <= now.time() <= datetime.strptime("15:00", "%H:%M").time()


def market_closed_for_day():
    cst = pytz.timezone("US/Central")
    return datetime.now(cst).time() > datetime.strptime("15:00", "%H:%M").time()


def get_all_tickers():
    """Fetch active US tickers via Yahoo Finance screener — no yahoo_fin dependency."""
    print("Fetching ticker list from Yahoo Finance screener...")
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        tickers = []
        for offset in range(0, 5000, 250):
            url = (
                "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved"
                f"?formatted=false&lang=en-US&region=US&scrIds=most_actives"
                f"&count=250&offset={offset}"
            )
            r = requests.get(url, headers=headers, timeout=15)
            data = r.json()
            quotes = (
                data.get("finance", {})
                    .get("result", [{}])[0]
                    .get("quotes", [])
            )
            if not quotes:
                break
            tickers.extend([q["symbol"] for q in quotes if q.get("symbol")])

        # Deduplicate and filter junk symbols
        clean = []
        seen = set()
        for t in tickers:
            if not t or t in seen:
                continue
            seen.add(t)
            if "$" in t or t.endswith("-W") or t.endswith("-R") or t.endswith("-U"):
                continue
            clean.append(t)

        print(f"  {len(clean)} tickers loaded.")
        return clean

    except Exception as e:
        print(f"  Screener fetch failed: {e}. Using fallback list.")
        return [
            "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "NFLX",
            "AMD", "INTC", "JPM", "BAC", "WFC", "GS", "V", "MA", "UNH",
            "JNJ", "PG", "KO", "PEP", "DIS", "PYPL", "ADBE", "CRM", "ORCL",
            "IBM", "QCOM", "TXN", "AVGO", "CSCO", "AMAT", "MU", "LRCX",
        ]


# ── Fast price update ──────────────────────────────────────────────────────────

def fetch_prices_batch(batch: list) -> dict:
    """One yf.download() call for the whole batch."""
    tickers_str = " ".join(batch)
    _stderr = sys.stderr
    try:
        sys.stderr = io.StringIO()  # suppress delisted/404 noise
        df = yf.download(
            tickers_str,
            period="1d",
            interval="1m",
            progress=False,
            threads=True,
            auto_adjust=True,
        )
    except Exception as e:
        sys.stderr = _stderr
        print(f"    download error: {e}")
        return {}
    finally:
        sys.stderr = _stderr

    if df.empty:
        return {}

    multi = len(batch) > 1
    result = {}

    for ticker in batch:
        try:
            if multi:
                closes = df["Close"][ticker].dropna()
                highs  = df["High"][ticker].dropna()
                lows   = df["Low"][ticker].dropna()
                vols   = df["Volume"][ticker].dropna()
                opens  = df["Open"][ticker].dropna()
            else:
                closes = df["Close"].dropna()
                highs  = df["High"].dropna()
                lows   = df["Low"].dropna()
                vols   = df["Volume"].dropna()
                opens  = df["Open"].dropna()

            if closes.empty:
                continue

            result[ticker] = {
                "price":      round(float(closes.iloc[-1]), 2),
                "dayHigh":    round(float(highs.max()),    2) if not highs.empty else 0.0,
                "dayLow":     round(float(lows.min()),     2) if not lows.empty else 0.0,
                "volume":     int(vols.sum())                 if not vols.empty else 0,
                "open_price": round(float(opens.iloc[0]),  2) if not opens.empty else 0.0,
            }
        except Exception:
            pass

    return result


def run_price_pass(tickers: list, sleep_time: int):
    prev_closes: dict = {}
    try:
        resp = supabase.table("stocks").select("symbol, close_price").execute()
        if resp.data:
            prev_closes = {r["symbol"]: r["close_price"] or 0.0 for r in resp.data}
    except Exception as e:
        print(f"  Could not fetch prev_closes: {e}")

    total_upserted = 0
    total_batches  = (len(tickers) + PRICE_BATCH - 1) // PRICE_BATCH

    for i in range(0, len(tickers), PRICE_BATCH):
        batch     = tickers[i:i + PRICE_BATCH]
        batch_num = i // PRICE_BATCH + 1
        prices    = fetch_prices_batch(batch)

        upserts = []
        for ticker, d in prices.items():
            cp         = d["price"]
            prev_close = prev_closes.get(ticker, cp)
            change     = round(cp - prev_close, 2)
            change_pct = round((change / prev_close) * 100, 4) if prev_close else 0.0
            upserts.append({
                "symbol":        ticker,
                "price":         cp,
                "change":        change,
                "changePercent": change_pct,
                "dayHigh":       d["dayHigh"],
                "dayLow":        d["dayLow"],
                "volume":        d["volume"],
                "open_price":    d["open_price"],
                "updatedAt":     "now()",
            })

        if upserts:
            try:
                supabase.table("stocks").upsert(upserts).execute()
                total_upserted += len(upserts)
                print(f"  [PRICE] Batch {batch_num}/{total_batches} — {len(upserts)} records pushed OK")
            except Exception as e:
                print(f"  [PRICE] Batch {batch_num}/{total_batches} — DB error: {e}")
        else:
            print(f"  [PRICE] Batch {batch_num}/{total_batches} — no valid data")

        time.sleep(sleep_time)

    return total_upserted


# ── Fundamentals update (every 4 hours) ───────────────────────────────────────

def compute_avg_daily_chg(ticker: str) -> float:
    try:
        hist = yf.Ticker(ticker).history(period="1mo")
        if len(hist) >= 2:
            return round(float(hist["Close"].pct_change().dropna().abs().mean() * 100), 4)
    except Exception:
        pass
    return 0.0


def run_fundamentals_pass(tickers: list):
    print("  [FUNDAMENTALS] Starting pass...")
    total = 0
    total_batches = (len(tickers) + FUND_BATCH - 1) // FUND_BATCH

    for i in range(0, len(tickers), FUND_BATCH):
        batch     = tickers[i:i + FUND_BATCH]
        batch_num = i // FUND_BATCH + 1
        upserts   = []

        for ticker in batch:
            try:
                info = yf.Ticker(ticker).info
                cp   = safe_float(info.get("currentPrice") or info.get("regularMarketPrice"))
                if cp == 0.0:
                    hist = yf.Ticker(ticker).history(period="1d")
                    if not hist.empty:
                        cp = safe_float(hist["Close"].iloc[-1])
                    else:
                        continue
                upserts.append({
                    "symbol":         ticker,
                    "name":           info.get("shortName", ticker),
                    "high52w":        safe_float(info.get("fiftyTwoWeekHigh")),
                    "low52w":         safe_float(info.get("fiftyTwoWeekLow")),
                    "bid":            safe_float(info.get("bid")),
                    "ask":            safe_float(info.get("ask")),
                    "market_cap":     safe_float(info.get("marketCap")),
                    "pe_ratio":       safe_float(info.get("trailingPE")),
                    "revenue_growth": safe_float(info.get("revenueGrowth")),
                    "close_price":    safe_float(
                        info.get("previousClose") or info.get("regularMarketPreviousClose")
                    ),
                    "avg_daily_chg":  compute_avg_daily_chg(ticker),
                    "updatedAt":      "now()",
                })
            except Exception:
                pass

        if upserts:
            try:
                supabase.table("stocks").upsert(upserts).execute()
                total += len(upserts)
                print(f"  [FUNDAMENTALS] Batch {batch_num}/{total_batches} — {len(upserts)} records pushed OK")
            except Exception as e:
                print(f"  [FUNDAMENTALS] Batch {batch_num}/{total_batches} — DB error: {e}")

        time.sleep(FUND_SLEEP)

    print(f"  [FUNDAMENTALS] Done — {total} records updated.")


# ── End-of-day history flush ───────────────────────────────────────────────────

def write_history_for_all(tickers: list):
    print("  [HISTORY] End-of-day flush starting...")
    today_str = datetime.now(pytz.timezone("US/Central")).strftime("%Y-%m-%d")

    for i in range(0, len(tickers), PRICE_BATCH):
        batch = tickers[i:i + PRICE_BATCH]
        try:
            prices_res  = supabase.table("stocks").select("symbol, price").in_("symbol", batch).execute()
            history_res = supabase.table("stock_history").select("symbol, prices").in_("symbol", batch).execute()

            current_prices = {r["symbol"]: r.get("price", 0.0) for r in (prices_res.data or [])}
            history_dict   = {r["symbol"]: r.get("prices", [])  for r in (history_res.data or [])}

            upserts = []
            for sym in batch:
                if sym not in current_prices:
                    continue
                hp = history_dict.get(sym, [])
                cp = current_prices[sym]
                if hp and hp[-1].get("date") == today_str:
                    hp[-1]["price"] = cp
                else:
                    hp.append({"date": today_str, "price": cp})
                upserts.append({
                    "symbol":    sym,
                    "prices":    hp[-MAX_HISTORY_POINTS:],
                    "updatedAt": "now()",
                })

            if upserts:
                supabase.table("stock_history").upsert(upserts).execute()
        except Exception as e:
            print(f"  [HISTORY] Batch error: {e}")

        time.sleep(1)

    print("  [HISTORY] Flush complete.")


# ── Main loop ──────────────────────────────────────────────────────────────────

def main():
    global history_written_today, current_date_str, last_fundamentals_time

    tickers = get_all_tickers()
    last_fundamentals_time = time.time()  # defer first fundamentals run by 4h

    print("Entering continuous price-update loop...")
    while True:
        cst        = pytz.timezone("US/Central")
        now_cst    = datetime.now(cst)
        today_date = now_cst.strftime("%Y-%m-%d")

        if today_date != current_date_str:
            current_date_str      = today_date
            history_written_today = False

        market_open = is_market_open()
        sleep_time  = MARKET_SLEEP if market_open else CLOSED_SLEEP

        print(
            f"\n[CYCLE] {now_cst.strftime('%H:%M:%S')} | "
            f"market={'OPEN' if market_open else 'CLOSED'} | "
            f"sleep={sleep_time}s/batch | tickers={len(tickers)}"
        )

        n = run_price_pass(tickers, sleep_time)
        print(f"  Price pass complete — {n} records upserted.")

        if time.time() - last_fundamentals_time >= FUND_INTERVAL_SEC:
            run_fundamentals_pass(tickers)
            last_fundamentals_time = time.time()

        if market_closed_for_day() and not history_written_today:
            write_history_for_all(tickers)
            history_written_today = True


if __name__ == "__main__":
    main()
