'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Chart, registerables } from 'chart.js/auto';
import {
  FaChevronDown,
  FaMagnifyingGlass,
  FaSpinner,
  FaCircleCheck,
  FaCircleXmark,
  FaArrowTrendUp,
  FaArrowTrendDown,
} from 'react-icons/fa6';

Chart.register(...registerables);

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh?: number;
  dayLow?: number;
  high52w?: number;
  low52w?: number;
  bid?: number;
  ask?: number;
  market_cap?: number;
  pe_ratio?: number;
  revenue_growth?: number;
  open_price?: number;
  close_price?: number;
  avg_daily_chg?: number;
}

interface Holding {
  shares: number;
  avgCost: number;
}

interface ShortPosition {
  shares: number;
  avgShortPrice: number;
}

interface TradeEntry {
  id: string;
  date: string;
  type: 'BUY' | 'SELL' | 'SHORT' | 'COVER';
  ticker: string;
  name: string;
  shares: number;
  price: number;
  total: number;
}

interface PortfolioSnapshot {
  t: number;
  v: number;
}

interface Competition {
  id: string;           // UUID
  name: string;
  admin_user_id: string;
  starting_cash: number;
  start_date: string;
  end_date: string;
  status: string;       // 'open' | 'active' | 'ended' etc.
  created_at: string;
  visibility: string;
  join_code: string;
}

interface LeaderboardEntry {
  uid: string;
  display_name: string;
  photo_url: string | null;
  total_value: number;
  return_pct: number;
  updated_at: string;
  enrolled_at?: string;
}

type CompStatus = 'enrolling' | 'active' | 'ended';

function getCompStatus(comp: Competition): CompStatus {
  const s = comp.status?.toLowerCase() ?? '';
  if (s === 'ended' || s === 'completed' || s === 'closed') return 'ended';
  if (s === 'active') return 'active';
  if (s === 'open' || s === 'enrolling') return 'enrolling';
  // fallback to date-based
  const now = new Date();
  const start = new Date(comp.start_date);
  const end = new Date(comp.end_date);
  if (now > end) return 'ended';
  if (now >= start) return 'active';
  return 'enrolling';
}

export default function Simulator() {
  const { user, authLoading, isBanned } = useAuth();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'stocks'>('portfolio');
  const [gameMode, setGameMode] = useState<'main' | 'competition' | 'leaderboard'>('main');
  const [cash, setCash] = useState<number>(100000.0);
  const [holdings, setHoldings] = useState<Record<string, Holding>>({});
  const [marketData, setMarketData] = useState<Record<string, StockData>>({});
  const [historyCache, setHistoryCache] = useState<Record<string, { date: string; price: number }[]>>({});

  const [detailTicker, setDetailTicker] = useState<string | null>(null);
  const [detailRange, setDetailRange] = useState<string>('1M');
  const [stocksSortCol, setStocksSortCol] = useState<keyof StockData>('volume');
  const [stocksSortDir, setStocksSortDir] = useState<-1 | 1>(-1);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const [shorts, setShorts] = useState<Record<string, ShortPosition>>({});
  const [compShorts, setCompShorts] = useState<Record<string, ShortPosition>>({});

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTicker, setModalTicker] = useState<string>('');
  const [modalType, setModalType] = useState<'BUY' | 'SELL' | 'SHORT' | 'COVER'>('BUY');
  const [modalQty, setModalQty] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');
  const [modalSuccess, setModalSuccess] = useState<string>('');
  const [modalMode, setModalMode] = useState<'main' | 'competition'>('main');

  const [isDark, setIsDark] = useState<boolean>(false);
  const [marketLoading, setMarketLoading] = useState<boolean>(true);
  const [tradeInFlight, setTradeInFlight] = useState<boolean>(false);

  const [tradeLog, setTradeLog] = useState<TradeEntry[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [stocksPage, setStocksPage] = useState(0);
  const [tableSearch, setTableSearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const lastSnapRef = useRef<number>(0);
  const sessionSnapDone = useRef(false);
  const STOCKS_PER_PAGE = 50;

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [compEnrolled, setCompEnrolled] = useState(false);
  const [compCash, setCompCash] = useState(100000);
  const [compHoldings, setCompHoldings] = useState<Record<string, Holding>>({});
  const [compTradeLog, setCompTradeLog] = useState<TradeEntry[]>([]);
  const [compSnapshots, setCompSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [compLoading, setCompLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const [lbTab, setLbTab] = useState<'main' | 'competition'>('main');
  const [mainLb, setMainLb] = useState<LeaderboardEntry[]>([]);
  const [compLb, setCompLb] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbLoaded, setLbLoaded] = useState(false);

  const portfolioChartRef = useRef<HTMLCanvasElement | null>(null);
  const compPortfolioChartRef = useRef<HTMLCanvasElement | null>(null);
  const detailChartRef = useRef<HTMLCanvasElement | null>(null);
  const portfolioChartInst = useRef<Chart | null>(null);
  const compPortfolioChartInst = useRef<Chart | null>(null);
  const detailChartInst = useRef<Chart | null>(null);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatVolume = (v?: number) => {
    if (v === undefined || v === null) return '—';
    if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return v.toString();
  };

  const formatMktCap = (v?: number) => {
    if (v === undefined || v === null) return '—';
    if (v >= 1e12) return '$' + (v / 1e12).toFixed(2) + 'T';
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    return '$' + v.toLocaleString();
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cachedState = localStorage.getItem('game_state');
    if (cachedState) {
      try {
        const data = JSON.parse(cachedState);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (data.cash !== undefined) setCash(data.cash);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (data.holdings) setHoldings(data.holdings);
      } catch {}
    }

    const cachedMarket = localStorage.getItem('market_data_lite');
    if (cachedMarket) {
      try {
        const parsed = JSON.parse(cachedMarket);
        const map: Record<string, StockData> = {};
        Object.keys(parsed).forEach(symbol => {
          map[symbol] = { symbol, ...parsed[symbol] };
        });
        setMarketData(map);
        setMarketLoading(false);
      } catch {}
    }

    try {
      const t = localStorage.getItem('trade_log');
      if (t) setTradeLog(JSON.parse(t));
    } catch {}
    try {
      const w = localStorage.getItem('watchlist');
      if (w) setWatchlist(JSON.parse(w));
    } catch {}
    try {
      const s = localStorage.getItem('portfolio_snapshots');
      if (s) {
        const parsed: PortfolioSnapshot[] = JSON.parse(s);
        setSnapshots(parsed);
        if (parsed.length > 0) lastSnapRef.current = parsed[parsed.length - 1].t;
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Channel must be created synchronously before any async work so the
    // cleanup closure captures it and React StrictMode double-invoke doesn't
    // try to add callbacks to an already-subscribed channel.
    const channel = supabase
      .channel('public:stocks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stocks' }, payload => {
        const updated = payload.new as StockData & { symbol: string };
        if (updated && updated.symbol) {
          setMarketData(prev => ({
            ...prev,
            [updated.symbol]: {
              symbol: updated.symbol, name: updated.name,
              price: updated.price, change: updated.change,
              changePercent: updated.changePercent, volume: updated.volume,
              dayHigh: updated.dayHigh, dayLow: updated.dayLow,
              high52w: updated.high52w, low52w: updated.low52w,
              bid: updated.bid, ask: updated.ask,
              market_cap: updated.market_cap, pe_ratio: updated.pe_ratio,
              revenue_growth: updated.revenue_growth, open_price: updated.open_price,
              close_price: updated.close_price, avg_daily_chg: updated.avg_daily_chg,
            },
          }));
        }
      })
      .subscribe();

    const loadMarketData = async () => {
      const PAGE_SIZE = 500;
      let from = 0;
      let keepGoing = true;
      const fullMarket: Record<string, StockData> = {};

      while (keepGoing) {
        const { data, error } = await supabase
          .from('stocks')
          .select('*')
          .range(from, from + PAGE_SIZE - 1);

        if (error) { console.error('Supabase stocks fetch error:', error); break; }

        if (data && data.length > 0) {
          data.forEach(row => {
            fullMarket[row.symbol] = {
              symbol: row.symbol,
              name: row.name,
              price: row.price,
              change: row.change,
              changePercent: row.changePercent,
              volume: row.volume,
              dayHigh: row.dayHigh,
              dayLow: row.dayLow,
              high52w: row.high52w,
              low52w: row.low52w,
              bid: row.bid,
              ask: row.ask,
              market_cap: row.market_cap,
              pe_ratio: row.pe_ratio,
              revenue_growth: row.revenue_growth,
              open_price: row.open_price,
              close_price: row.close_price,
              avg_daily_chg: row.avg_daily_chg,
            };
          });

          setMarketData(prev => {
            const updated = { ...prev, ...fullMarket };
            const liteCache: Record<string, Omit<StockData, 'symbol'>> = {};
            Object.keys(updated).forEach(sym => {
              const d = updated[sym];
              liteCache[sym] = {
                name: d.name, price: d.price, change: d.change,
                changePercent: d.changePercent, volume: d.volume,
                dayHigh: d.dayHigh, dayLow: d.dayLow,
                high52w: d.high52w, low52w: d.low52w,
                bid: d.bid, ask: d.ask,
                market_cap: d.market_cap, pe_ratio: d.pe_ratio,
                revenue_growth: d.revenue_growth, open_price: d.open_price,
                close_price: d.close_price, avg_daily_chg: d.avg_daily_chg,
              };
            });
            localStorage.setItem('market_data_lite', JSON.stringify(liteCache));
            return updated;
          });

          setMarketLoading(false);
          from += PAGE_SIZE;
          keepGoing = data.length === PAGE_SIZE;
        } else {
          keepGoing = false;
        }
      }
    };

    loadMarketData();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    const loadGameState = async () => {
      const { data, error } = await supabase
        .from('game_state')
        .select('cash, holdings')
        .eq('uid', user.id)
        .maybeSingle();

      if (!mounted) return;
      if (error) { console.error('Failed to load game state:', error); return; }

      if (data) {
        const newCash = data.cash ?? 100000.0;
        const rawHoldings = data.holdings || {};
        const normalizedHoldings: Record<string, Holding> = {};
        const normalizedShorts: Record<string, ShortPosition> = {};
        Object.keys(rawHoldings).forEach(key => {
          if (key.startsWith('SHORT:')) {
            const sym = key.slice(6);
            const val = rawHoldings[key];
            normalizedShorts[sym] = { shares: val?.shares || 0, avgShortPrice: val?.avgShortPrice || 0 };
          } else {
            const val = rawHoldings[key];
            normalizedHoldings[key] = typeof val === 'number'
              ? { shares: val, avgCost: 0 }
              : { shares: val?.shares || 0, avgCost: val?.avgCost || 0 };
          }
        });
        setCash(newCash);
        setHoldings(normalizedHoldings);
        setShorts(normalizedShorts);
        localStorage.setItem('game_state', JSON.stringify({ cash: newCash, holdings: normalizedHoldings }));
      } else {
        const initialCash = 100000.0;
        setCash(initialCash);
        setHoldings({});
        await supabase
          .from('game_state')
          .upsert({ uid: user.id, cash: initialCash, holdings: {} }, { onConflict: 'uid', ignoreDuplicates: true });
        if (mounted) localStorage.setItem('game_state', JSON.stringify({ cash: initialCash, holdings: {} }));
      }
    };

    loadGameState();

    const stateChannel = supabase
      .channel('game_state_updates')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_state',
        filter: `uid=eq.${user.id}`,
      }, payload => {
        if (payload.new) {
          const newCash = (payload.new as { cash?: number; holdings?: Record<string, unknown> }).cash ?? 100000.0;
          const rawHoldings = (payload.new as { cash?: number; holdings?: Record<string, unknown> }).holdings || {};
          const normalizedHoldings: Record<string, Holding> = {};
          const normalizedShorts: Record<string, ShortPosition> = {};
          Object.keys(rawHoldings).forEach(key => {
            if (key.startsWith('SHORT:')) {
              const sym = key.slice(6);
              const val = rawHoldings[key] as { shares?: number; avgShortPrice?: number } | null;
              normalizedShorts[sym] = { shares: val?.shares || 0, avgShortPrice: val?.avgShortPrice || 0 };
            } else {
              const val = rawHoldings[key] as number | { shares?: number; avgCost?: number } | null;
              normalizedHoldings[key] = typeof val === 'number'
                ? { shares: val, avgCost: 0 }
                : { shares: (val as { shares?: number })?.shares || 0, avgCost: (val as { avgCost?: number })?.avgCost || 0 };
            }
          });
          setCash(newCash);
          setHoldings(normalizedHoldings);
          setShorts(normalizedShorts);
          localStorage.setItem('game_state', JSON.stringify({ cash: newCash, holdings: normalizedHoldings }));
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(stateChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    const loadCompetition = async () => {
      if (mounted) setCompLoading(true);
      try {
        const { data: comps, error: compsErr } = await supabase
          .from('competitions')
          .select('*')
          .order('start_date', { ascending: false })
          .limit(1);

        if (!mounted) return;
        if (compsErr) { console.error('competitions fetch error:', compsErr); return; }
        if (!comps || comps.length === 0) return;

        const comp = comps[0] as Competition;
        setCompetition(comp);

        const { data: enrollment, error: enrollErr } = await supabase
          .from('competition_portfolios')
          .select('cash, holdings, total_value')
          .eq('user_id', user.id)
          .eq('competition_id', comp.id)
          .maybeSingle();

        if (!mounted) return;
        if (enrollErr) {
          console.error('enrollment fetch error:', enrollErr?.message, '| code:', enrollErr?.code, '| hint:', enrollErr?.hint);
          // Table may not exist yet — still show competition so user can enroll
        }

        if (!enrollErr && enrollment) {
          setCompEnrolled(true);
          setCompCash(enrollment.cash ?? comp.starting_cash);
          const raw = enrollment.holdings || {};
          const normalizedHoldings: Record<string, Holding> = {};
          const normalizedShorts: Record<string, ShortPosition> = {};
          Object.keys(raw).forEach(key => {
            if (key.startsWith('SHORT:')) {
              const sym = key.slice(6);
              const val = raw[key];
              normalizedShorts[sym] = { shares: val?.shares || 0, avgShortPrice: val?.avgShortPrice || 0 };
            } else {
              const val = raw[key];
              normalizedHoldings[key] = typeof val === 'number'
                ? { shares: val, avgCost: 0 }
                : { shares: val?.shares || 0, avgCost: val?.avgCost || 0 };
            }
          });
          setCompHoldings(normalizedHoldings);
          setCompShorts(normalizedShorts);
        }
      } catch (e) {
        console.error('loadCompetition error:', e);
      } finally {
        if (mounted) setCompLoading(false);
      }
    };

    loadCompetition();
    return () => { mounted = false; };
  }, [user?.id]);

  const { totalValue, returnAmt, returnPct, holdingsList } = useMemo(() => {
    let holdingsTotal = 0;
    const list = Object.keys(holdings).map(ticker => {
      const h = holdings[ticker];
      const shares = h.shares;
      const avgCost = h.avgCost;
      const currentPrice = marketData[ticker]?.price || avgCost;
      const name = marketData[ticker]?.name || ticker;
      const invested = shares * avgCost;
      const currentValue = shares * currentPrice;
      holdingsTotal += currentValue;
      const retAmt = invested > 0 ? currentValue - invested : 0;
      const retPct = invested > 0 ? (retAmt / invested) * 100 : 0;
      return { ticker, name, shares, avgCost, currentPrice, invested, currentValue, returnAmt: retAmt, returnPct: retPct };
    }).filter(h => h.shares > 0);

    const shortLiability = Object.keys(shorts).reduce((sum, sym) => {
      return sum + shorts[sym].shares * (marketData[sym]?.price ?? shorts[sym].avgShortPrice);
    }, 0);
    const total = cash + holdingsTotal - shortLiability;
    const rAmt = total - 100000.0;
    const rPct = (rAmt / 100000.0) * 100;
    return { totalValue: total, returnAmt: rAmt, returnPct: rPct, holdingsList: list };
  }, [cash, holdings, shorts, marketData]);

  const {
    totalValue: compTotalValue,
    returnAmt: compReturnAmt,
    returnPct: compReturnPct,
    holdingsList: compHoldingsList,
  } = useMemo(() => {
    const baseline = competition?.starting_cash ?? 100000;
    let holdingsTotal = 0;
    const list = Object.keys(compHoldings).map(ticker => {
      const h = compHoldings[ticker];
      const shares = h.shares;
      const avgCost = h.avgCost;
      const currentPrice = marketData[ticker]?.price || avgCost;
      const name = marketData[ticker]?.name || ticker;
      const invested = shares * avgCost;
      const currentValue = shares * currentPrice;
      holdingsTotal += currentValue;
      const retAmt = invested > 0 ? currentValue - invested : 0;
      const retPct = invested > 0 ? (retAmt / invested) * 100 : 0;
      return { ticker, name, shares, avgCost, currentPrice, invested, currentValue, returnAmt: retAmt, returnPct: retPct };
    }).filter(h => h.shares > 0);

    const shortLiability = Object.keys(compShorts).reduce((sum, sym) => {
      return sum + compShorts[sym].shares * (marketData[sym]?.price ?? compShorts[sym].avgShortPrice);
    }, 0);
    const total = compCash + holdingsTotal - shortLiability;
    const rAmt = total - baseline;
    const rPct = (rAmt / baseline) * 100;
    return { totalValue: total, returnAmt: rAmt, returnPct: rPct, holdingsList: list };
  }, [compCash, compHoldings, compShorts, marketData, competition]);

  const fetchStockHistory = async (ticker: string) => {
    if (historyCache[ticker]) return historyCache[ticker];
    try {
      const { data } = await supabase
        .from('stock_history')
        .select('prices')
        .eq('symbol', ticker)
        .single();
      const prices = data ? data.prices || [] : [];
      setHistoryCache(prev => ({ ...prev, [ticker]: prices }));
      return prices;
    } catch (e) {
      console.error(`[History] Failed to fetch history for ${ticker}:`, e);
      return [];
    }
  };

  const filterHistory = (history: { date: string; price: number }[], range: string) => {
    const now = new Date();
    let days = 30;
    if (range === '1W') days = 7;
    else if (range === '1M') days = 30;
    else if (range === '3M') days = 90;
    else if (range === '6M') days = 180;
    else if (range === '1Y') days = 365;
    else if (range === '5Y') days = 1825;
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);
    return history.filter(h => new Date(h.date) >= cutoff);
  };

  const recordSnapshot = useCallback((value: number, force = false) => {
    const now = Date.now();
    if (!force && now - lastSnapRef.current < 60 * 60 * 1000) return;
    lastSnapRef.current = now;
    setSnapshots(prev => {
      const updated = [...prev, { t: now, v: value }].slice(-365);
      localStorage.setItem('portfolio_snapshots', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleWatchlist = (ticker: string) => {
    setWatchlist(prev => {
      const next = prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker];
      localStorage.setItem('watchlist', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (sessionSnapDone.current) return;
    if (Object.keys(marketData).length === 0) return;
    sessionSnapDone.current = true;
    recordSnapshot(totalValue);
  }, [totalValue, marketData, recordSnapshot]);

  const buildChartConfig = useCallback((snapsArr: PortfolioSnapshot[], dark: boolean) => {
    const first = snapsArr[0].v;
    const last = snapsArr[snapsArr.length - 1].v;
    const isUp = last >= first;
    const borderColor = isUp ? '#2e7d32' : '#d32f2f';
    const backgroundColor = isUp ? 'rgba(46,125,50,0.08)' : 'rgba(211,47,47,0.08)';
    const gridColor = dark ? 'rgba(142,186,126,0.06)' : 'rgba(43,66,36,0.05)';
    const textColor = dark ? '#8fa887' : '#9ca3af';
    return {
      type: 'line' as const,
      data: {
        labels: snapsArr.map(s => {
          const d = new Date(s.t);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Portfolio Value',
          data: snapsArr.map(s => s.v),
          fill: true,
          borderColor,
          backgroundColor,
          borderWidth: 2,
          pointRadius: snapsArr.length <= 15 ? 3 : 0,
          pointBackgroundColor: borderColor,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
            callbacks: { label: (ctx: { raw: unknown }) => `Value: ${formatMoney(ctx.raw as number)}` },
          },
        },
        scales: {
          x: { display: true, grid: { display: false }, ticks: { color: textColor, font: { size: 10, family: 'DM Mono' }, maxTicksLimit: 6 } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10, family: 'DM Mono' }, callback: (v: unknown) => formatMoney(v as number) } },
        },
        elements: { line: { tension: 0.3 } },
      },
    };
  }, []);

  useEffect(() => {
    if (!portfolioChartRef.current) return;
    if (portfolioChartInst.current) { portfolioChartInst.current.destroy(); portfolioChartInst.current = null; }
    if (snapshots.length < 2) return;
    const ctx = portfolioChartRef.current.getContext('2d');
    if (!ctx) return;
    portfolioChartInst.current = new Chart(ctx, buildChartConfig(snapshots, isDark));
    return () => { if (portfolioChartInst.current) { portfolioChartInst.current.destroy(); portfolioChartInst.current = null; } };
  }, [snapshots, isDark, buildChartConfig]);

  useEffect(() => {
    if (!compPortfolioChartRef.current) return;
    if (compPortfolioChartInst.current) { compPortfolioChartInst.current.destroy(); compPortfolioChartInst.current = null; }
    if (compSnapshots.length < 2) return;
    const ctx = compPortfolioChartRef.current.getContext('2d');
    if (!ctx) return;
    compPortfolioChartInst.current = new Chart(ctx, buildChartConfig(compSnapshots, isDark));
    return () => { if (compPortfolioChartInst.current) { compPortfolioChartInst.current.destroy(); compPortfolioChartInst.current = null; } };
  }, [compSnapshots, isDark, buildChartConfig]);

  useEffect(() => {
    if (!detailChartRef.current || !detailTicker) return;
    let active = true;

    const renderChart = async () => {
      const history = await fetchStockHistory(detailTicker);
      if (!active) return;
      const filtered = filterHistory(history, detailRange);
      if (detailChartInst.current) detailChartInst.current.destroy();
      if (!detailChartRef.current) return;
      const ctx = detailChartRef.current.getContext('2d');
      if (!ctx) return;

      const gridColor = isDark ? 'rgba(142, 186, 126, 0.06)' : 'rgba(43, 66, 36, 0.05)';
      const textColor = isDark ? '#8fa887' : '#9ca3af';
      const isUp = filtered.length >= 2 ? filtered[filtered.length - 1].price >= filtered[0].price : true;
      const strokeColor = isUp ? '#2e7d32' : '#d32f2f';
      const fillColor = isUp ? 'rgba(46, 125, 50, 0.06)' : 'rgba(211, 47, 47, 0.06)';

      detailChartInst.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: filtered.map(d => d.date),
          datasets: [{
            label: 'Price', data: filtered.map(d => d.price),
            fill: true, borderColor: strokeColor, backgroundColor: fillColor,
            borderWidth: 2, pointRadius: 0,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index', intersect: false,
              callbacks: { label: (context) => `Price: ${formatMoney(context.raw as number)}` },
            },
          },
          scales: {
            x: { display: true, grid: { display: false }, ticks: { color: textColor, font: { size: 9, family: 'DM Mono' }, maxTicksLimit: 6 } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 9, family: 'DM Mono' }, callback: (v) => formatMoney(v as number) } },
          },
          elements: { line: { tension: 0.2 } },
        },
      });
    };

    renderChart();
    return () => {
      active = false;
      if (detailChartInst.current) { detailChartInst.current.destroy(); detailChartInst.current = null; }
    };
  }, [detailTicker, detailRange, isDark, historyCache]);

  const sortedStocks = useMemo(() => {
    let list = Object.values(marketData);
    if (tableSearch.trim()) {
      const q = tableSearch.toUpperCase().trim();
      list = list.filter(s => s.symbol.includes(q) || (s.name || '').toUpperCase().includes(q));
    }
    list.sort((a, b) => {
      if (stocksSortCol === 'symbol') return stocksSortDir * a.symbol.localeCompare(b.symbol);
      if (stocksSortCol === 'volume') return stocksSortDir * (a.price * a.volume - b.price * b.volume);
      return stocksSortDir * (((a[stocksSortCol] as number) || 0) - ((b[stocksSortCol] as number) || 0));
    });
    return list;
  }, [marketData, stocksSortCol, stocksSortDir, tableSearch]);

  const pagedStocks = useMemo(
    () => sortedStocks.slice(stocksPage * STOCKS_PER_PAGE, (stocksPage + 1) * STOCKS_PER_PAGE),
    [sortedStocks, stocksPage]
  );
  const totalPages = Math.ceil(sortedStocks.length / STOCKS_PER_PAGE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStocksPage(0);
  }, [tableSearch, stocksSortCol]);

  const handleSortChange = (col: keyof StockData) => {
    if (stocksSortCol === col) {
      setStocksSortDir(prev => (prev === -1 ? 1 : -1));
    } else {
      setStocksSortCol(col);
      setStocksSortDir(col === 'symbol' ? 1 : -1);
    }
  };

  const searchMatches = useMemo(() => {
    const query = searchQuery.toUpperCase().trim();
    if (query.length === 0) return [];
    return Object.values(marketData)
      .filter(stock => stock.symbol.toUpperCase().includes(query) || (stock.name || '').toUpperCase().includes(query))
      .slice(0, 8);
  }, [searchQuery, marketData]);

  const processTrade = async (type: 'BUY' | 'SELL' | 'SHORT' | 'COVER', ticker: string, qty: number, mode: 'main' | 'competition' = 'main') => {
    if (!user) return { error: 'Please log in to trade.' };
    if (tradeInFlight) return { error: 'Transaction in progress. Please wait...' };
    setTradeInFlight(true);

    try {
      const price = marketData[ticker]?.price;
      if (!price) return { error: 'Market data unavailable.' };
      const cost = price * qty;
      if (cost < 0 || isNaN(cost)) return { error: 'Invalid transaction calculation.' };

      const currentCash = mode === 'competition' ? compCash : cash;
      const currentHoldings = mode === 'competition' ? compHoldings : holdings;
      const currentShorts = mode === 'competition' ? compShorts : shorts;

      const updatedHoldings = { ...currentHoldings };
      const updatedShorts = { ...currentShorts };
      if (!updatedHoldings[ticker]) updatedHoldings[ticker] = { shares: 0, avgCost: 0 };
      const holding = updatedHoldings[ticker];
      let newCash = currentCash;

      if (type === 'BUY') {
        if (cost > currentCash) return { error: 'Insufficient buying power.' };
        newCash -= cost;
        const existingVal = holding.shares * holding.avgCost;
        holding.shares += qty;
        holding.avgCost = (existingVal + cost) / holding.shares;
      } else if (type === 'SELL') {
        if (holding.shares < qty) return { error: 'Insufficient shares to sell.' };
        newCash += cost;
        holding.shares -= qty;
        if (holding.shares === 0) delete updatedHoldings[ticker];
      } else if (type === 'SHORT') {
        // Receive proceeds, add to short positions
        newCash += cost;
        if (!updatedShorts[ticker]) updatedShorts[ticker] = { shares: 0, avgShortPrice: 0 };
        const existing = updatedShorts[ticker];
        const totalShares = existing.shares + qty;
        updatedShorts[ticker] = {
          shares: totalShares,
          avgShortPrice: (existing.shares * existing.avgShortPrice + cost) / totalShares,
        };
        // Clean up empty long holding we pre-created
        if (updatedHoldings[ticker]?.shares === 0) delete updatedHoldings[ticker];
      } else if (type === 'COVER') {
        if (!currentShorts[ticker] || currentShorts[ticker].shares < qty)
          return { error: 'No short position to cover.' };
        if (cost > currentCash) return { error: 'Insufficient cash to cover.' };
        newCash -= cost;
        updatedShorts[ticker] = { ...updatedShorts[ticker], shares: updatedShorts[ticker].shares - qty };
        if (updatedShorts[ticker].shares === 0) delete updatedShorts[ticker];
        // Clean up empty long holding we pre-created
        if (updatedHoldings[ticker]?.shares === 0) delete updatedHoldings[ticker];
      }

      const newHoldingsValue = Object.keys(updatedHoldings).reduce((sum, sym) => {
        const h = updatedHoldings[sym];
        return sum + h.shares * (marketData[sym]?.price ?? h.avgCost);
      }, 0);
      const newShortLiability = Object.keys(updatedShorts).reduce((sum, sym) => {
        return sum + updatedShorts[sym].shares * (marketData[sym]?.price ?? updatedShorts[sym].avgShortPrice);
      }, 0);
      const newTotal = newCash + newHoldingsValue - newShortLiability;

      // Merge shorts into holdings for DB storage using SHORT: prefix keys
      const dbHoldings = {
        ...updatedHoldings,
        ...Object.fromEntries(
          Object.entries(updatedShorts).map(([sym, pos]) => [`SHORT:${sym}`, pos])
        ),
      };

      if (mode === 'competition') {
        const { error } = await supabase
          .from('competition_portfolios')
          .update({
            cash: newCash,
            holdings: dbHoldings,
            total_value: newTotal,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('competition_id', competition!.id);

        if (error) { console.error('Competition trade persist error:', error); return { error: 'Failed to save trade. Check your connection.' }; }

        setCompCash(newCash);
        setCompHoldings(updatedHoldings);
        setCompShorts(updatedShorts);

        const entry: TradeEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: new Date().toISOString(),
          type, ticker,
          name: marketData[ticker]?.name || ticker,
          shares: qty, price, total: cost,
        };
        setCompTradeLog(prev => [entry, ...prev].slice(0, 200));
        const now = Date.now();
        setCompSnapshots(prev => [...prev, { t: now, v: newTotal }].slice(-365));
      } else {
        const { error } = await supabase
          .from('game_state')
          .update({ cash: newCash, holdings: dbHoldings, total_value: newTotal })
          .eq('uid', user.id);

        if (error) { console.error('Trade persist error:', error); return { error: 'Failed to save trade. Check your connection.' }; }

        setCash(newCash);
        setHoldings(updatedHoldings);
        setShorts(updatedShorts);
        localStorage.setItem('game_state', JSON.stringify({ cash: newCash, holdings: updatedHoldings }));

        const entry: TradeEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: new Date().toISOString(),
          type, ticker,
          name: marketData[ticker]?.name || ticker,
          shares: qty, price, total: cost,
        };
        setTradeLog(prev => {
          const updated = [entry, ...prev].slice(0, 200);
          localStorage.setItem('trade_log', JSON.stringify(updated));
          return updated;
        });
        recordSnapshot(newTotal, true);
      }

      return { success: true };
    } catch (e) {
      console.error('Trade error:', e);
      return { error: 'Failed to process trade. Check connection.' };
    } finally {
      setTradeInFlight(false);
    }
  };

  const openQuickModal = (ticker: string, type: 'BUY' | 'SELL' | 'SHORT' | 'COVER') => {
    setModalMode(gameMode === 'competition' ? 'competition' : 'main');
    setModalTicker(ticker);
    setModalType(type);
    setModalQty('');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setModalError('');
    setModalSuccess('');
    const qty = parseInt(modalQty);
    if (isNaN(qty) || qty <= 0) { setModalError('Enter a valid number of shares.'); return; }
    const res = await processTrade(modalType, modalTicker, qty, modalMode);
    if (res?.error) {
      setModalError(res.error);
    } else {
      const actionLabel = modalType === 'BUY' ? 'Bought' : modalType === 'SELL' ? 'Sold' : modalType === 'SHORT' ? 'Shorted' : 'Covered';
      setModalSuccess(`${actionLabel} ${qty} share${qty !== 1 ? 's' : ''} of ${modalTicker}!`);
      setModalQty('');
      setTimeout(() => setIsModalOpen(false), 1500);
    }
  };

  const resetPortfolio = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('game_state')
      .update({ cash: 100000.0, holdings: {} })
      .eq('uid', user.id);
    if (!error) {
      setCash(100000.0);
      setHoldings({});
      setShorts({});
      localStorage.setItem('game_state', JSON.stringify({ cash: 100000.0, holdings: {} }));
    }
  };

  const resetCompetitionPortfolio = async () => {
    if (!user || !competition) return;
    const { error } = await supabase
      .from('competition_portfolios')
      .update({
        cash: competition.starting_cash,
        holdings: {},
        total_value: competition.starting_cash,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('competition_id', competition.id);
    if (!error) {
      setCompCash(competition.starting_cash);
      setCompHoldings({});
      setCompShorts({});
      setCompTradeLog([]);
      setCompSnapshots([]);
    }
  };

  const enrollInCompetition = async () => {
    if (!user || !competition) return;
    setEnrolling(true);
    try {
      const { error } = await supabase
        .from('competition_portfolios')
        .insert({
          user_id: user.id,
          competition_id: competition.id,
          cash: competition.starting_cash,
          holdings: {},
          total_value: competition.starting_cash,
        });
      if (!error) {
        setCompEnrolled(true);
        setCompCash(competition.starting_cash);
        setCompHoldings({});
      }
    } finally {
      setEnrolling(false);
    }
  };

  const loadLeaderboard = async () => {
    if (lbLoaded) return;
    setLbLoading(true);
    try {
      const [{ data: mainData }, { data: compData }] = await Promise.all([
        supabase.rpc('get_main_leaderboard'),
        competition
          ? supabase.rpc('get_competition_leaderboard', { comp_id: competition.id })
          : Promise.resolve({ data: [] }),
      ]);
      setMainLb((mainData || []) as LeaderboardEntry[]);
      setCompLb((compData || []) as LeaderboardEntry[]);
      setLbLoaded(true);
    } finally {
      setLbLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (gameMode === 'leaderboard') loadLeaderboard();
  }, [gameMode]);

  const selectedStockDetail = detailTicker ? marketData[detailTicker] : null;

  const currentHoldingsForModal = modalMode === 'competition' ? compHoldings : holdings;

  const renderPortfolio = (isComp: boolean) => {
    const tv = isComp ? compTotalValue : totalValue;
    const ra = isComp ? compReturnAmt : returnAmt;
    const rp = isComp ? compReturnPct : returnPct;
    const hl = isComp ? compHoldingsList : holdingsList;
    const c = isComp ? compCash : cash;
    const tl = isComp ? compTradeLog : tradeLog;
    const chartRef = isComp ? compPortfolioChartRef : portfolioChartRef;
    const snaps = isComp ? compSnapshots : snapshots;

    return (
      <div className="flex flex-col gap-5">
        {!authLoading && !user && (
          <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-12 shadow-sm text-center">
            <h3 className="font-serif text-2xl font-bold text-primary dark:text-[#e8f0e0] mb-2">Log in to start trading</h3>
            <p className="text-sm text-[#6b7280] dark:text-[#8fa887] mb-6 max-w-[340px] mx-auto">
              Create a free account to practice with $100,000 in virtual buying power.
            </p>
            <Link
              href="/auth"
              className="bg-primary hover:bg-primary-light dark:bg-primary-light dark:hover:bg-sage text-cream font-bold px-8 py-3.5 rounded-full transition-all shadow-md text-sm inline-block"
            >
              Log In / Sign Up
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-6 shadow-sm col-span-2 xl:col-span-1">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#9ca3af] dark:text-[#6b7d65] block mb-2">Total Value</span>
            <div className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0]">{formatMoney(tv)}</div>
          </div>
          <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-6 shadow-sm">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#9ca3af] dark:text-[#6b7d65] block mb-2">Total Return</span>
            <div className={`font-serif text-2xl font-black ${ra >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {ra >= 0 ? '+' : ''}{formatMoney(ra)}
            </div>
            <div className={`text-xs font-bold mt-1 ${ra >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {ra >= 0 ? '+' : ''}{rp.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-6 shadow-sm">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#9ca3af] dark:text-[#6b7d65] block mb-2">Cash</span>
            <div className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0]">{formatMoney(c)}</div>
          </div>
          <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-6 shadow-sm">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#9ca3af] dark:text-[#6b7d65] block mb-2">Positions</span>
            <div className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0]">{hl.length}</div>
            <div className="text-xs text-[#9ca3af] dark:text-[#6b7d65] mt-1">open</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#9ca3af] dark:text-[#6b7d65]">Portfolio Allocation</span>
            <div className="flex gap-4 font-mono text-[10px]">
              <span className="flex items-center gap-1.5 text-[#9ca3af] dark:text-[#6b7d65]">
                <span className="w-2 h-2 rounded-sm bg-primary/25 dark:bg-mint/25 inline-block" />
                Cash {((c / Math.max(tv, 1)) * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1.5 text-[#9ca3af] dark:text-[#6b7d65]">
                <span className="w-2 h-2 rounded-sm bg-primary dark:bg-mint inline-block" />
                Invested {(((tv - c) / Math.max(tv, 1)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-primary/8 dark:bg-mint/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary dark:bg-mint rounded-full transition-all duration-700"
              style={{ width: `${Math.max(0, Math.min(100, ((tv - c) / Math.max(tv, 1)) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#9ca3af] dark:text-[#6b7d65]">Performance</span>
            {snaps.length >= 2 && (
              <span className={`font-bold text-xs ${ra >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {ra >= 0 ? '+' : ''}{rp.toFixed(2)}% all time
              </span>
            )}
          </div>
          {snaps.length < 2 ? (
            <div className="h-[160px] flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-xs font-semibold text-[#9ca3af] dark:text-[#6b7d65]">No history yet</p>
              <p className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65]">Make your first trade to start tracking performance.</p>
            </div>
          ) : (
            <div className="h-[160px] relative">
              <canvas ref={chartRef} />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-primary/6 dark:border-mint/8 flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0]">Holdings</h3>
            <div className="flex items-center gap-3">
              {hl.length > 0 && (
                <button
                  onClick={() => setActiveTab('stocks')}
                  className="text-xs font-semibold text-primary-light dark:text-mint hover:text-primary dark:hover:text-cream transition-colors cursor-pointer"
                >
                  + Add position
                </button>
              )}
              {user && (
                <button
                  onClick={() => {
                    if (confirm(`Reset your ${isComp ? 'competition' : ''} portfolio? This cannot be undone.`)) {
                      isComp ? resetCompetitionPortfolio() : resetPortfolio();
                    }
                  }}
                  className="text-xs font-semibold text-[#9ca3af] dark:text-[#6b7d65] hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {hl.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <div className="w-12 h-12 rounded-full bg-primary/6 dark:bg-mint/10 flex items-center justify-center mb-4">
                <FaArrowTrendUp className="text-primary-light dark:text-mint text-lg" />
              </div>
              <p className="font-semibold text-sm text-primary dark:text-[#e8f0e0] mb-1">No positions yet</p>
              <p className="text-xs text-[#9ca3af] dark:text-[#6b7d65] mb-5 max-w-[260px]">
                You have {formatMoney(c)} in buying power ready to invest.
              </p>
              <button
                onClick={() => setActiveTab('stocks')}
                className="bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-xs px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                Browse Markets →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-primary/6 dark:border-mint/8">
                    <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-6 md:px-8 py-3.5">Asset</th>
                    <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5">Shares</th>
                    <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5 hidden sm:table-cell">Avg Cost</th>
                    <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5">Price</th>
                    <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5 hidden md:table-cell">Value</th>
                    <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5">Return</th>
                    <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-6 md:px-8 py-3.5">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {hl.map(item => (
                    <tr key={item.ticker} className="border-b border-primary/4 dark:border-mint/5 last:border-0 hover:bg-primary/2 dark:hover:bg-mint/3 transition-colors">
                      <td className="px-6 md:px-8 py-4">
                        <button
                          onClick={() => { setActiveTab('stocks'); setDetailTicker(item.ticker); }}
                          className="text-left cursor-pointer group"
                        >
                          <div className="font-bold text-sm text-primary dark:text-[#e8f0e0] group-hover:text-primary-light dark:group-hover:text-mint transition-colors">{item.ticker}</div>
                          <div className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65] truncate max-w-[140px]">{item.name}</div>
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-sm text-primary dark:text-[#e8f0e0]">{item.shares}</td>
                      <td className="px-4 py-4 text-right text-sm text-primary dark:text-[#e8f0e0] hidden sm:table-cell">{formatMoney(item.avgCost)}</td>
                      <td className="px-4 py-4 text-right text-sm text-primary dark:text-[#e8f0e0]">{formatMoney(item.currentPrice)}</td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-primary dark:text-[#e8f0e0] hidden md:table-cell">{formatMoney(item.currentValue)}</td>
                      <td className="px-4 py-4 text-right">
                        <div className={`text-sm font-bold ${item.returnAmt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.returnAmt >= 0 ? '+' : ''}{formatMoney(item.returnAmt)}
                        </div>
                        <div className={`text-[10px] font-semibold ${item.returnAmt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.returnPct >= 0 ? '+' : ''}{item.returnPct.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-4">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => openQuickModal(item.ticker, 'BUY')}
                            className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >Buy</button>
                          <button
                            onClick={() => openQuickModal(item.ticker, 'SELL')}
                            className="bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >Sell</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {(() => {
          const currentShorts = isComp ? compShorts : shorts;
          const shortsList = Object.keys(currentShorts).map(sym => {
            const sp = currentShorts[sym];
            const currentPrice = marketData[sym]?.price ?? sp.avgShortPrice;
            const pl = (sp.avgShortPrice - currentPrice) * sp.shares;
            const plPerShare = sp.avgShortPrice - currentPrice;
            return { sym, sp, currentPrice, pl, plPerShare };
          }).filter(s => s.sp.shares > 0);

          if (shortsList.length === 0) return null;
          return (
            <div className="bg-white dark:bg-[#242924] border border-rose-200/60 dark:border-rose-900/30 rounded-[20px] shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-rose-100/60 dark:border-rose-900/20">
                <h3 className="font-serif text-lg font-bold text-rose-700 dark:text-rose-400">Short Positions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-rose-100/60 dark:border-rose-900/20">
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-6 md:px-8 py-3.5">Ticker</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5">Shares</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5 hidden sm:table-cell">Shorted At</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5">Current</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5 hidden md:table-cell">P/L / Share</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-6 md:px-8 py-3.5">Total P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortsList.map(({ sym, sp, currentPrice, pl, plPerShare }) => (
                      <tr key={sym} className="border-b border-rose-100/40 dark:border-rose-900/15 last:border-0 hover:bg-rose-50/40 dark:hover:bg-rose-900/10 transition-colors">
                        <td className="px-6 md:px-8 py-4">
                          <button
                            onClick={() => { setActiveTab('stocks'); setDetailTicker(sym); }}
                            className="text-left cursor-pointer group"
                          >
                            <div className="font-bold text-sm text-primary dark:text-[#e8f0e0] group-hover:text-primary-light dark:group-hover:text-mint transition-colors">{sym}</div>
                            <div className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65] truncate max-w-[140px]">{marketData[sym]?.name || sym}</div>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-sm text-primary dark:text-[#e8f0e0]">{sp.shares}</td>
                        <td className="px-4 py-4 text-right text-sm text-primary dark:text-[#e8f0e0] hidden sm:table-cell">{formatMoney(sp.avgShortPrice)}</td>
                        <td className="px-4 py-4 text-right text-sm text-primary dark:text-[#e8f0e0]">{formatMoney(currentPrice)}</td>
                        <td className="px-4 py-4 text-right hidden md:table-cell">
                          <span className={`text-sm font-bold ${plPerShare >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {plPerShare >= 0 ? '+' : ''}{formatMoney(plPerShare)}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 text-right">
                          <div className={`text-sm font-bold ${pl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {pl >= 0 ? '+' : ''}{formatMoney(pl)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm overflow-hidden">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="w-full px-6 md:px-8 py-5 flex justify-between items-center cursor-pointer"
          >
            <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0]">Trade History</h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65]">{tl.length} trade{tl.length !== 1 ? 's' : ''}</span>
              <FaChevronDown className={`text-[#9ca3af] text-xs transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {showHistory && (
              <motion.div
                key="history-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="border-t border-primary/6 dark:border-mint/8">
                  {tl.length === 0 ? (
                    <p className="px-8 py-8 text-center text-xs text-[#9ca3af] dark:text-[#6b7d65]">No trades recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-primary/6 dark:border-mint/8">
                            <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-6 md:px-8 py-3">Date</th>
                            <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-4 py-3">Type</th>
                            <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-4 py-3">Ticker</th>
                            <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3">Shares</th>
                            <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3">Price</th>
                            <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-6 md:px-8 py-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tl.map(entry => (
                            <tr key={entry.id} className="border-b border-primary/4 dark:border-mint/5 last:border-0 hover:bg-primary/2 dark:hover:bg-mint/3 transition-colors">
                              <td className="px-6 md:px-8 py-3 font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] whitespace-nowrap">
                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' '}
                                {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  entry.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-600' :
                                  entry.type === 'SELL' ? 'bg-rose-500/10 text-rose-600' :
                                  entry.type === 'SHORT' ? 'bg-orange-100 text-orange-700' :
                                  'bg-violet-100 text-violet-700'
                                }`}>
                                  {entry.type}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{entry.ticker}</div>
                                <div className="text-[10px] text-[#9ca3af] truncate max-w-[100px]">{entry.name}</div>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-bold text-primary dark:text-[#e8f0e0]">{entry.shares}</td>
                              <td className="px-4 py-3 text-right text-sm text-primary dark:text-[#e8f0e0]">{formatMoney(entry.price)}</td>
                              <td className="px-6 md:px-8 py-3 text-right text-sm font-bold text-primary dark:text-[#e8f0e0]">{formatMoney(entry.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderMarkets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
      <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-primary/6 dark:border-mint/8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0]">Markets</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-44">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[10px] pointer-events-none" />
              <input
                type="text"
                placeholder="Filter stocks…"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="w-full py-2 pl-8 pr-3 rounded-xl border border-primary/10 dark:border-mint/10 bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-xs focus:outline-none focus:border-primary/30 dark:focus:border-mint/30 transition-all"
              />
            </div>
            <span className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] whitespace-nowrap flex items-center gap-1.5 shrink-0">
              {marketLoading ? <><FaSpinner className="animate-spin" /> loading…</> : `${sortedStocks.length.toLocaleString()} stocks`}
            </span>
          </div>
        </div>

        {marketLoading && Object.keys(marketData).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#9ca3af] dark:text-[#6b7d65]">
            <FaSpinner className="animate-spin text-2xl text-primary-light dark:text-mint" />
            <p className="text-sm font-semibold">Syncing market data…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-primary/6 dark:border-mint/8 select-none">
                  <th onClick={() => handleSortChange('symbol')} className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-6 md:px-8 py-3.5 cursor-pointer hover:text-primary dark:hover:text-mint transition-colors">
                    Symbol {stocksSortCol === 'symbol' ? (stocksSortDir === 1 ? '▲' : '▼') : <span className="opacity-35">↕</span>}
                  </th>
                  <th onClick={() => handleSortChange('price')} className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5 cursor-pointer hover:text-primary dark:hover:text-mint transition-colors">
                    Price {stocksSortCol === 'price' ? (stocksSortDir === 1 ? '▲' : '▼') : <span className="opacity-35">↕</span>}
                  </th>
                  <th onClick={() => handleSortChange('changePercent')} className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5 cursor-pointer hover:text-primary dark:hover:text-mint transition-colors">
                    Change {stocksSortCol === 'changePercent' ? (stocksSortDir === 1 ? '▲' : '▼') : <span className="opacity-35">↕</span>}
                  </th>
                  <th onClick={() => handleSortChange('volume')} className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-6 md:px-8 py-3.5 cursor-pointer hover:text-primary dark:hover:text-mint transition-colors hidden sm:table-cell">
                    Volume {stocksSortCol === 'volume' ? (stocksSortDir === 1 ? '▲' : '▼') : <span className="opacity-35">↕</span>}
                  </th>
                  <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-center w-10 px-3 py-3.5">★</th>
                </tr>
              </thead>
              <tbody>
                {pagedStocks.map(stock => {
                  const isUp = stock.change >= 0;
                  const isSelected = detailTicker === stock.symbol;
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => setDetailTicker(stock.symbol)}
                      className={`border-b border-primary/4 dark:border-mint/5 last:border-0 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 dark:bg-mint/8' : 'hover:bg-primary/2 dark:hover:bg-mint/3'}`}
                    >
                      <td className="px-6 md:px-8 py-3.5">
                        <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{stock.symbol}</div>
                        <div className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65] truncate max-w-[120px]">{stock.name}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-sm text-primary dark:text-[#e8f0e0]">{formatMoney(stock.price)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                          {isUp ? <FaArrowTrendUp className="text-[9px]" /> : <FaArrowTrendDown className="text-[9px]" />}
                          {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-3.5 text-right font-mono text-xs text-[#9ca3af] dark:text-[#6b7d65] hidden sm:table-cell">
                        {formatVolume(stock.volume)}
                      </td>
                      <td className="px-3 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleWatchlist(stock.symbol)}
                          className={`text-base leading-none transition-colors ${watchlist.includes(stock.symbol) ? 'text-amber-400' : 'text-[#d1d5db] dark:text-[#3a4a38] hover:text-amber-400'}`}
                        >★</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-6 md:px-8 py-4 border-t border-primary/6 dark:border-mint/8 flex items-center justify-between">
                <button
                  onClick={() => setStocksPage(p => Math.max(0, p - 1))}
                  disabled={stocksPage === 0}
                  className="text-xs font-semibold text-[#9ca3af] dark:text-[#6b7d65] disabled:opacity-30 hover:text-primary dark:hover:text-mint transition-colors cursor-pointer disabled:cursor-default"
                >← Prev</button>
                <span className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65]">{stocksPage + 1} / {totalPages}</span>
                <button
                  onClick={() => setStocksPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={stocksPage >= totalPages - 1}
                  className="text-xs font-semibold text-[#9ca3af] dark:text-[#6b7d65] disabled:opacity-30 hover:text-primary dark:hover:text-mint transition-colors cursor-pointer disabled:cursor-default"
                >Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm sticky top-28 overflow-hidden">
        <div className="p-5 border-b border-primary/6 dark:border-mint/8">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] dark:text-[#6b7d65] text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search ticker or company…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full py-2.5 pl-9 pr-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all placeholder-[#9ca3af] dark:placeholder-[#6b7d65]"
            />
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#242924] border border-primary/10 dark:border-mint/10 rounded-xl mt-1.5 shadow-xl z-50 max-h-[220px] overflow-y-auto">
                {searchMatches.length > 0 ? searchMatches.map(match => (
                  <div
                    key={match.symbol}
                    onClick={() => { setDetailTicker(match.symbol); setSearchQuery(''); setShowSearchResults(false); }}
                    className="py-2.5 px-4 cursor-pointer flex justify-between items-center border-b border-primary/5 dark:border-mint/5 hover:bg-primary/4 dark:hover:bg-mint/8 last:border-b-0 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{match.symbol}</span>
                      <span className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65] ml-2">{match.name}</span>
                    </div>
                    <span className="font-bold text-xs text-primary dark:text-[#e8f0e0]">{formatMoney(match.price)}</span>
                  </div>
                )) : (
                  <div className="py-4 px-4 text-center text-xs text-[#9ca3af] dark:text-[#6b7d65] font-semibold">No results</div>
                )}
              </div>
            )}
          </div>
        </div>

        {!selectedStockDetail ? (
          <div>
            {watchlist.length > 0 && (
              <div className="p-5 border-b border-primary/6 dark:border-mint/8">
                <span className="font-mono text-[10px] tracking-wider uppercase text-[#9ca3af] dark:text-[#6b7d65] block mb-3">Watchlist</span>
                <div className="flex flex-col gap-0.5">
                  {watchlist.map(ticker => {
                    const s = marketData[ticker];
                    if (!s) return null;
                    const up = s.change >= 0;
                    return (
                      <div
                        key={ticker}
                        onClick={() => setDetailTicker(ticker)}
                        className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-primary/4 dark:hover:bg-mint/6 cursor-pointer group transition-colors"
                      >
                        <div>
                          <span className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{ticker}</span>
                          <span className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65] ml-2 hidden sm:inline truncate">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs ${up ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMoney(s.price)}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                            {up ? '+' : ''}{s.changePercent.toFixed(2)}%
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); toggleWatchlist(ticker); }}
                            className="opacity-0 group-hover:opacity-100 text-[#9ca3af] hover:text-rose-500 text-xs transition-all leading-none"
                            title="Remove"
                          >✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-col items-center justify-center py-14 text-center px-8 gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/6 dark:bg-mint/10 flex items-center justify-center">
                <FaMagnifyingGlass className="text-primary-light dark:text-mint" />
              </div>
              <p className="font-semibold text-sm text-primary dark:text-[#e8f0e0]">Select a stock</p>
              <p className="text-xs text-[#9ca3af] dark:text-[#6b7d65] max-w-[200px] leading-relaxed">Click any row in the table or search above.</p>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0]">{selectedStockDetail.symbol}</h3>
                  <button
                    onClick={() => toggleWatchlist(selectedStockDetail.symbol)}
                    className={`text-lg leading-none transition-colors ${watchlist.includes(selectedStockDetail.symbol) ? 'text-amber-400' : 'text-[#d1d5db] dark:text-[#3a4a38] hover:text-amber-400'}`}
                    title={watchlist.includes(selectedStockDetail.symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
                  >★</button>
                </div>
                <div className="text-xs text-[#9ca3af] dark:text-[#6b7d65] truncate max-w-[180px] mt-0.5">{selectedStockDetail.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-primary dark:text-[#e8f0e0]">{formatMoney(selectedStockDetail.price)}</div>
                <div className={`text-xs font-bold mt-0.5 flex items-center gap-1 justify-end ${selectedStockDetail.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedStockDetail.change >= 0 ? <FaArrowTrendUp className="text-[10px]" /> : <FaArrowTrendDown className="text-[10px]" />}
                  {selectedStockDetail.change >= 0 ? '+' : ''}{selectedStockDetail.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="h-[180px] w-full relative mb-3">
              <canvas ref={detailChartRef} />
            </div>

            <div className="flex gap-0.5 mb-5">
              {['1W', '1M', '3M', '6M', '1Y', '5Y'].map(range => (
                <button
                  key={range}
                  onClick={() => setDetailRange(range)}
                  className={`flex-1 py-1.5 text-[9px] font-mono font-bold rounded-lg transition-all cursor-pointer ${range === detailRange ? 'bg-primary dark:bg-primary-light text-cream' : 'text-[#9ca3af] dark:text-[#6b7d65] hover:text-primary dark:hover:text-mint hover:bg-primary/5 dark:hover:bg-mint/5'}`}
                >{range}</button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-px bg-primary/6 dark:bg-mint/8 rounded-xl overflow-hidden mb-5">
              {[
                { label: 'Open', value: selectedStockDetail.open_price ? formatMoney(selectedStockDetail.open_price) : '—', cls: '' },
                { label: 'Prev Close', value: selectedStockDetail.close_price ? formatMoney(selectedStockDetail.close_price) : '—', cls: '' },
                { label: 'Day High', value: selectedStockDetail.dayHigh ? formatMoney(selectedStockDetail.dayHigh) : '—', cls: 'text-emerald-600' },
                { label: 'Day Low', value: selectedStockDetail.dayLow ? formatMoney(selectedStockDetail.dayLow) : '—', cls: 'text-rose-600' },
                { label: '52W High', value: selectedStockDetail.high52w ? formatMoney(selectedStockDetail.high52w) : '—', cls: '' },
                { label: '52W Low', value: selectedStockDetail.low52w ? formatMoney(selectedStockDetail.low52w) : '—', cls: '' },
                { label: 'Volume', value: formatVolume(selectedStockDetail.volume), cls: '' },
                { label: 'Market Cap', value: selectedStockDetail.market_cap ? formatMktCap(selectedStockDetail.market_cap) : '—', cls: '' },
                { label: 'P/E Ratio', value: selectedStockDetail.pe_ratio ? selectedStockDetail.pe_ratio.toFixed(1) : '—', cls: '' },
                { label: 'Rev Growth', value: selectedStockDetail.revenue_growth ? `${(selectedStockDetail.revenue_growth * 100).toFixed(1)}%` : '—', cls: selectedStockDetail.revenue_growth && selectedStockDetail.revenue_growth > 0 ? 'text-emerald-600' : selectedStockDetail.revenue_growth && selectedStockDetail.revenue_growth < 0 ? 'text-rose-600' : '' },
                { label: 'Avg Daily Chg', value: selectedStockDetail.avg_daily_chg ? `${selectedStockDetail.avg_daily_chg.toFixed(2)}%` : '—', cls: '' },
                { label: 'Bid / Ask', value: (selectedStockDetail.bid && selectedStockDetail.ask) ? `${formatMoney(selectedStockDetail.bid)} / ${formatMoney(selectedStockDetail.ask)}` : '—', cls: '' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="bg-white dark:bg-[#242924] px-4 py-3 flex justify-between items-center">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65]">{label}</span>
                  <span className={`font-bold text-xs ${cls || 'text-primary dark:text-[#e8f0e0]'}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="relative">
              {!user && (
                <div className="absolute inset-0 bg-white/80 dark:bg-[#242924]/85 backdrop-blur-[3px] rounded-xl flex flex-col items-center justify-center z-10 gap-2">
                  <span className="text-xs font-bold text-primary dark:text-[#e8f0e0]">Log in to trade</span>
                  <Link href="/auth" className="bg-primary hover:bg-primary-light dark:bg-primary-light text-cream font-bold px-5 py-2 rounded-full text-xs transition-all">Sign In</Link>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openQuickModal(selectedStockDetail.symbol, 'BUY')}
                  disabled={!user}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm active:scale-98"
                >Buy</button>
                <button
                  onClick={() => openQuickModal(selectedStockDetail.symbol, 'SELL')}
                  disabled={!user || !(gameMode === 'competition' ? compHoldings[selectedStockDetail.symbol]?.shares : holdings[selectedStockDetail.symbol]?.shares)}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm active:scale-98"
                >Sell</button>
                <button
                  onClick={() => openQuickModal(selectedStockDetail.symbol, 'SHORT')}
                  disabled={!user}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm active:scale-98"
                >Short</button>
                <button
                  onClick={() => openQuickModal(selectedStockDetail.symbol, 'COVER')}
                  disabled={!user || !(gameMode === 'competition' ? compShorts[selectedStockDetail.symbol]?.shares : shorts[selectedStockDetail.symbol]?.shares)}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm active:scale-98"
                >Cover</button>
              </div>
              {(() => {
                const h = gameMode === 'competition' ? compHoldings[selectedStockDetail.symbol] : holdings[selectedStockDetail.symbol];
                const sp = gameMode === 'competition' ? compShorts[selectedStockDetail.symbol] : shorts[selectedStockDetail.symbol];
                const currentPrice = marketData[selectedStockDetail.symbol]?.price ?? 0;
                return (
                  <div className="mt-2.5 space-y-0.5">
                    {(h?.shares ?? 0) > 0 && (
                      <div className="text-center text-[10px] text-[#9ca3af] dark:text-[#6b7d65] font-mono">
                        You own {h!.shares} share{h!.shares !== 1 ? 's' : ''} · avg {formatMoney(h!.avgCost)}
                      </div>
                    )}
                    {(sp?.shares ?? 0) > 0 && (
                      <div className="text-center text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        Short: {sp!.shares} share{sp!.shares !== 1 ? 's' : ''} · avg {formatMoney(sp!.avgShortPrice)} · P/L: {(() => {
                          const pl = (sp!.avgShortPrice - currentPrice) * sp!.shares;
                          return <span className={pl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{pl >= 0 ? '+' : ''}{formatMoney(pl)}</span>;
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isBanned) {
    return (
      <div className="flex-1 flex items-center justify-center bg-warm-white dark:bg-[#1a1f1a] px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-rose-600 dark:text-rose-400 text-2xl">🚫</span>
          </div>
          <h2 className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0] mb-2">Account Suspended</h2>
          <p className="text-sm text-[#6b7280] dark:text-[#8fa887]">
            Your account has been suspended from the simulator. Contact a Brightside administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 relative bg-warm-white dark:bg-[#1a1f1a]">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 70% 50%, rgba(43,66,36,0.05) 0%, transparent 100%)' }} />

      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 py-28 relative z-10 flex-1 flex flex-col">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-1.5">Paper Trading</span>
            <h1 className="font-serif text-3xl font-black text-primary dark:text-[#e8f0e0]">Market Simulator</h1>
          </div>
          <div className="flex gap-1 bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-full p-1 shadow-sm self-start sm:self-auto">
            {(['main', 'competition', 'leaderboard'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setGameMode(mode)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer capitalize ${
                  gameMode === mode
                    ? 'bg-primary dark:bg-primary-light text-cream shadow-sm'
                    : 'text-[#9ca3af] dark:text-[#6b7d65] hover:text-primary dark:hover:text-mint'
                }`}
              >
                {mode === 'main' ? 'Main Game' : mode === 'competition' ? 'Competition' : 'Leaderboard'}
              </button>
            ))}
          </div>
        </div>

        {gameMode !== 'leaderboard' && (
          <div className="flex gap-1 bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-full p-1 shadow-sm self-start mb-6 w-fit">
            {(['portfolio', 'stocks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-primary/10 dark:bg-mint/15 text-primary dark:text-mint'
                    : 'text-[#9ca3af] dark:text-[#6b7d65] hover:text-primary dark:hover:text-mint'
                }`}
              >
                {tab === 'portfolio' ? 'Portfolio' : 'Markets'}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {gameMode === 'main' && activeTab === 'portfolio' && (
            <motion.div
              key="main-portfolio"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPortfolio(false)}
            </motion.div>
          )}

          {gameMode === 'main' && activeTab === 'stocks' && (
            <motion.div
              key="main-stocks"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderMarkets()}
            </motion.div>
          )}

          {gameMode === 'competition' && activeTab === 'portfolio' && (
            <motion.div
              key="comp-portfolio"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {compLoading ? (
                <div className="flex items-center justify-center py-20">
                  <FaSpinner className="animate-spin text-2xl text-primary-light dark:text-mint" />
                </div>
              ) : !competition ? (
                <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] p-12 shadow-sm text-center">
                  <p className="text-sm text-[#9ca3af] dark:text-[#6b7d65]">No active competition found.</p>
                </div>
              ) : !compEnrolled ? (
                <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[24px] p-8 md:p-12 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-2">
                        {getCompStatus(competition) === 'enrolling' ? 'Enrollment Open' : getCompStatus(competition) === 'active' ? 'Competition Active' : 'Competition Ended'}
                      </span>
                      <h2 className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0] mb-3">{competition.name}</h2>

                      <div className="flex gap-6 mb-6">
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] mb-1">Start</div>
                          <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">
                            {new Date(competition.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] mb-1">End</div>
                          <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">
                            {new Date(competition.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] mb-1">Starting Cash</div>
                          <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{formatMoney(competition.starting_cash)}</div>
                        </div>
                      </div>

                      {competition.join_code && (
                        <div className="text-xs text-[#9ca3af] dark:text-[#6b7d65] mb-6 font-mono">
                          Join code: <span className="font-bold text-primary dark:text-[#e8f0e0]">{competition.join_code}</span>
                        </div>
                      )}

                      {!user ? (
                        <Link href="/auth" className="bg-primary hover:bg-primary-light text-cream font-bold px-8 py-3.5 rounded-full text-sm inline-block transition-all shadow-md">
                          Log In to Join
                        </Link>
                      ) : getCompStatus(competition) === 'ended' ? (
                        <div className="text-sm text-[#9ca3af] dark:text-[#6b7d65] font-semibold">Competition has ended.</div>
                      ) : (
                        <button
                          onClick={enrollInCompetition}
                          disabled={enrolling}
                          className="bg-primary hover:bg-primary-light text-cream font-bold px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
                        >
                          {enrolling ? <FaSpinner className="animate-spin" /> : null}
                          {enrolling ? 'Joining…' : 'Join Competition'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary-light dark:text-mint mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary-light dark:bg-mint animate-pulse inline-block" />
                    Competition mode — {competition.name}
                  </div>
                  {renderPortfolio(true)}
                </div>
              )}
            </motion.div>
          )}

          {gameMode === 'competition' && activeTab === 'stocks' && (
            <motion.div
              key="comp-stocks"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderMarkets()}
            </motion.div>
          )}

          {gameMode === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-1 bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-full p-1 shadow-sm mb-6 w-fit">
                {(['main', 'competition'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setLbTab(t)}
                    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                      lbTab === t
                        ? 'bg-primary dark:bg-primary-light text-cream shadow-sm'
                        : 'text-[#9ca3af] dark:text-[#6b7d65] hover:text-primary dark:hover:text-mint'
                    }`}
                  >
                    {t === 'main' ? 'Main Game' : 'Competition'}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm overflow-hidden">
                <div className="px-6 md:px-8 py-5 border-b border-primary/6 dark:border-mint/8 flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0]">
                    {lbTab === 'main' ? 'All-Time Leaderboard' : (competition?.name ?? 'Competition Leaderboard')}
                  </h3>
                  {lbLoading && <FaSpinner className="animate-spin text-primary-light dark:text-mint" />}
                </div>

                {lbLoading ? (
                  <div className="flex items-center justify-center py-20 text-[#9ca3af]">
                    <FaSpinner className="animate-spin text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-primary/6 dark:border-mint/8">
                          <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-6 md:px-8 py-3.5">Rank</th>
                          <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-4 py-3.5">Trader</th>
                          <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5">Portfolio Value</th>
                          <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-6 md:px-8 py-3.5">Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(lbTab === 'main' ? mainLb : compLb).map((entry, idx) => {
                          const isMe = user?.id === entry.uid;
                          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                          return (
                            <tr
                              key={entry.uid}
                              className={`border-b border-primary/4 dark:border-mint/5 last:border-0 transition-colors ${isMe ? 'bg-primary/5 dark:bg-mint/8' : 'hover:bg-primary/2 dark:hover:bg-mint/3'}`}
                            >
                              <td className="px-6 md:px-8 py-4 font-mono text-sm font-bold text-[#9ca3af] dark:text-[#6b7d65]">
                                {medal ? <span className="text-base">{medal}</span> : `#${idx + 1}`}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2.5">
                                  {entry.photo_url ? (
                                    <img src={entry.photo_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-primary/15 dark:bg-mint/20 flex items-center justify-center text-[10px] font-bold text-primary dark:text-mint">
                                      {entry.display_name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">
                                      {entry.display_name}
                                      {isMe && <span className="ml-1.5 text-[10px] text-primary-light dark:text-mint font-bold">you</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right font-bold text-sm text-primary dark:text-[#e8f0e0]">{formatMoney(entry.total_value)}</td>
                              <td className="px-6 md:px-8 py-4 text-right">
                                <span className={`font-bold text-sm ${entry.return_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {entry.return_pct >= 0 ? '+' : ''}{entry.return_pct.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {(lbTab === 'main' ? mainLb : compLb).length === 0 && !lbLoading && (
                          <tr>
                            <td colSpan={4} className="px-8 py-16 text-center text-xs text-[#9ca3af] dark:text-[#6b7d65]">No entries yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="bg-white dark:bg-[#242924] border border-primary/10 dark:border-mint/10 rounded-2xl p-6 md:p-8 w-full max-w-[380px] shadow-2xl relative z-10"
            >
              <h3 className="font-serif text-xl font-bold text-primary dark:text-[#e8f0e0] mb-1">
                {modalType === 'BUY' ? 'Buy ' : modalType === 'SELL' ? 'Sell ' : modalType === 'SHORT' ? 'Short ' : 'Cover '}{modalTicker}
              </h3>
              {modalMode === 'competition' && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary-light dark:text-mint mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-light dark:bg-mint animate-pulse inline-block" />
                  Competition
                </div>
              )}
              <p className="text-xs text-[#6b7280] dark:text-[#8fa887] mb-6">
                Price: <span className="font-bold">{formatMoney(marketData[modalTicker]?.price || 0)}</span>
                {(modalType === 'BUY' || modalType === 'SELL') && <> · You own {currentHoldingsForModal[modalTicker]?.shares || 0} share{(currentHoldingsForModal[modalTicker]?.shares || 0) !== 1 ? 's' : ''}</>}
                {(modalType === 'SHORT' || modalType === 'COVER') && <> · Short: {(modalMode === 'competition' ? compShorts[modalTicker]?.shares : shorts[modalTicker]?.shares) || 0} share{((modalMode === 'competition' ? compShorts[modalTicker]?.shares : shorts[modalTicker]?.shares) || 0) !== 1 ? 's' : ''}</>}
              </p>

              <div className="mb-5">
                <input
                  type="number"
                  placeholder="Number of shares"
                  min="1"
                  step="1"
                  value={modalQty}
                  onChange={e => setModalQty(e.target.value)}
                  className="w-full py-3 px-5 rounded-xl border border-primary/15 dark:border-mint/15 focus:border-sage focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-cream text-center font-bold text-lg"
                  autoFocus
                />
              </div>

              <AnimatePresence>
                {modalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 text-xs font-semibold text-rose-600 bg-rose-500/10 py-2.5 px-4 rounded-lg flex items-center gap-2"
                  >
                    <FaCircleXmark /> <span>{modalError}</span>
                  </motion.div>
                )}
                {modalSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 text-xs font-semibold text-emerald-600 bg-emerald-500/10 py-2.5 px-4 rounded-lg flex items-center gap-2"
                  >
                    <FaCircleCheck /> <span>{modalSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-primary/15 dark:border-mint/15 hover:bg-primary/4 dark:hover:bg-mint/6 rounded-xl font-bold text-xs text-[#6b7280] dark:text-[#8fa887] cursor-pointer transition-all active:scale-97"
                >Cancel</button>
                <button
                  onClick={handleModalConfirm}
                  disabled={tradeInFlight}
                  className={`flex-[2] py-3 rounded-xl text-white font-bold text-xs shadow-md active:scale-97 cursor-pointer transition-all ${
                    modalType === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    modalType === 'SELL' ? 'bg-rose-600 hover:bg-rose-700' :
                    modalType === 'SHORT' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-violet-600 hover:bg-violet-700'
                  } flex justify-center items-center gap-2`}
                >
                  {tradeInFlight ? (
                    <FaSpinner className="animate-spin text-sm" />
                  ) : (
                    modalType === 'BUY' ? 'Buy Shares' :
                    modalType === 'SELL' ? 'Sell Shares' :
                    modalType === 'SHORT' ? 'Short Shares' :
                    'Cover Short'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
