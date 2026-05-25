'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, animate } from 'framer-motion';
import RevealOnScroll from '@/components/RevealOnScroll';

/* ─── Animated counter ─────────────────────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Data ─────────────────────────────────────────────────────────── */
const tickerFacts = [
  '57% of Americans can\'t cover a $1,000 emergency expense',
  'Financial literacy raises savings rates by up to 24%',
  '76% of teens say they want more money education in school',
  'The average American carries $5,700 in credit card debt',
  'Investing $100/mo at age 25 yields ~$350K by retirement',
  'Only 21 states require a personal finance course to graduate',
];

const programs = [
  {
    num: '01',
    age: 'Elementary · Ages 5–10',
    name: 'Money Sprouts',
    desc: 'Story-driven lessons that introduce kids to saving, earning, and the value of money — through games and hands-on activities.',
    topics: ['Saving', 'Earning', 'Needs vs. Wants', 'Giving'],
    bar: 'bg-mint',
  },
  {
    num: '02',
    age: 'Middle & High School · Ages 11–18',
    name: 'Smart Start',
    desc: 'Real-world money skills for students — from reading your first paycheck to building credit and planning for college.',
    topics: ['Budgeting', 'First Job', 'Credit Basics', 'College Planning'],
    bar: 'bg-gold-light',
  },
  {
    num: '03',
    age: 'Adults · Ages 18+',
    name: 'Financial Foundations',
    desc: 'A practical guide to adult money management — tackling debt, growing savings, and investing for the future.',
    topics: ['Debt Payoff', 'Investing', 'Emergency Fund', 'Retirement'],
    bar: 'bg-primary-light',
  },
];

const steps = [
  { num: '01', title: 'Choose Your Program', desc: 'Find the curriculum matched to your age and financial situation.' },
  { num: '02', title: 'Learn at Your Pace', desc: 'Access video lessons, guides, and interactive financial tools.' },
  { num: '03', title: 'Apply the Skills', desc: 'Use our simulator and worksheets on your real finances.' },
  { num: '04', title: 'Track Your Growth', desc: 'Earn a certificate and see measurable progress over time.' },
];

/* ─── Arrow icon ───────────────────────────────────────────────────── */
const Arrow = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M1 6.5h11M6.5 1l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════
          TICKER STRIP
      ══════════════════════════════════════════ */}
      <div
        className="bg-primary dark:bg-[#0d1209] overflow-hidden border-b border-white/8"
        style={{ paddingTop: 'calc(4.75rem + 18px)' /* clears fixed navbar pill */ }}
      >
        <div className="py-2.5 overflow-hidden">
          <motion.div
            className="flex gap-14 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
          >
            {[...tickerFacts, ...tickerFacts].map((fact, i) => (
              <span key={i} className="inline-flex items-center gap-3 font-mono text-[10.5px] tracking-[0.08em] text-cream/50 shrink-0">
                <span className="w-1 h-1 rounded-full bg-mint/70 shrink-0" />
                {fact}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[88vh] flex items-center pb-24 pt-16 px-6 md:px-16 overflow-hidden bg-warm-white dark:bg-[#1a1f1a] transition-colors duration-200">

        {/* Dot-grid background */}
        <div
          className="absolute inset-0 opacity-50 dark:opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(43,66,36,0.13) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
        {/* Gradient bloom */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_65%_40%,rgba(142,186,126,0.1)_0%,transparent_65%)] dark:bg-[radial-gradient(ellipse_70%_60%_at_65%_40%,rgba(142,186,126,0.05)_0%,transparent_65%)] pointer-events-none" />
        {/* Large decorative glyph */}
        <span className="absolute right-[-2rem] top-[-3rem] font-serif text-[28vw] font-black text-primary/[0.025] dark:text-mint/[0.025] leading-none select-none pointer-events-none hidden xl:block">
          $
        </span>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 xl:gap-24 items-center">

          {/* Left copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
          >
            {/* Eyebrow */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } } }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <span className="h-px w-8 bg-primary/30 dark:bg-mint/30" />
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-primary-light dark:text-mint">
                Free · Nonprofit · Est. 2024
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
              className="font-serif text-[clamp(3rem,5.5vw,5.5rem)] font-black leading-[1.02] tracking-[-0.025em] text-primary dark:text-[#e8f0e0] mb-7"
            >
              Money skills
              <br />
              <em className="not-italic text-primary-light dark:text-mint">for every</em>
              <br />
              chapter of life.
            </motion.h1>

            {/* Body */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } } }}
              className="text-base md:text-lg leading-relaxed text-[#4a5568] dark:text-[#8fa887] max-w-[460px] mb-10"
            >
              Brightside is a nonprofit building practical financial education — from kids learning to save their first dollar, to adults navigating retirement. 100% free, forever.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
              className="flex flex-wrap gap-3 mb-14"
            >
              <Link
                href="/courses"
                className="bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-sm px-8 py-4 rounded-full inline-flex items-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(43,66,36,0.28)] active:scale-[0.98]"
              >
                Explore Programs <Arrow />
              </Link>
              <Link
                href="/auth"
                className="border-2 border-primary/18 dark:border-mint/20 text-primary dark:text-[#e8f0e0] font-bold text-sm px-8 py-4 rounded-full inline-flex items-center gap-2.5 transition-all duration-200 hover:border-primary dark:hover:border-mint hover:bg-primary/4 dark:hover:bg-mint/6 active:scale-[0.98]"
              >
                Start Learning Free
              </Link>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.7, delay: 0.15 } } }}
              className="flex items-center gap-8 pt-8 border-t border-primary/10 dark:border-mint/10"
            >
              {[
                { val: '1,900+', label: 'Lives Impacted' },
                { val: '3', label: 'Age Programs' },
                { val: '100%', label: 'Always Free' },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-serif text-2xl md:text-[1.75rem] font-black text-primary dark:text-[#e8f0e0] block leading-tight">{s.val}</span>
                  <span className="font-mono text-[9px] tracking-[0.13em] uppercase text-[#9ca3af] dark:text-[#6b7d65] block mt-0.5">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: fintech card */}
          <motion.div
            initial={{ opacity: 0, y: 44, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mx-auto lg:mx-0 shrink-0"
          >
            <div className="bg-primary dark:bg-[#182118] rounded-[22px] p-6 shadow-[0_40px_80px_rgba(43,66,36,0.32)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.45)] relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-16 -right-16 w-52 h-52 bg-mint/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div>
                  <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-cream/35 block mb-1.5">Portfolio Overview</span>
                  <div className="font-serif text-[2.1rem] font-black text-cream leading-none">$127,430</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-mint text-[11px] font-bold">↑ +$4,201</span>
                    <span className="text-cream/35 text-[11px]">today</span>
                    <span className="bg-mint/20 text-mint text-[9px] font-bold px-2 py-0.5 rounded-full">+12.4%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  <span className="font-mono text-[9px] tracking-widest text-cream/30 uppercase">Live</span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="relative -mx-1 mb-5">
                <svg viewBox="0 0 340 68" className="w-full h-[68px]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#52b87a" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#52b87a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0 56 C18 50,32 60,52 48 C72 36,84 53,108 42 C132 31,144 46,164 36 C184 26,198 40,220 26 C242 12,256 28,276 16 C296 4,312 18,340 8 L340 68 L0 68Z"
                    fill="url(#sg)"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  />
                  <motion.path
                    d="M0 56 C18 50,32 60,52 48 C72 36,84 53,108 42 C132 31,144 46,164 36 C184 26,198 40,220 26 C242 12,256 28,276 16 C296 4,312 18,340 8"
                    fill="none" stroke="#52b87a" strokeWidth="1.5"
                    pathLength={1}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </div>

              {/* Allocation bars */}
              <div className="space-y-2.5 mb-5 relative z-10">
                <span className="font-mono text-[8.5px] tracking-[0.16em] uppercase text-cream/25 block mb-3">Allocation</span>
                {[
                  { label: 'Stocks', pct: 65, color: 'bg-mint' },
                  { label: 'Bonds', pct: 22, color: 'bg-gold-light' },
                  { label: 'Cash', pct: 13, color: 'bg-cream/40' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="font-mono text-[9.5px] text-cream/45 w-10 shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 1, delay: 1.05 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="font-mono text-[9.5px] text-cream/40 w-7 text-right shrink-0">{item.pct}%</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/8 mb-4" />

              {/* Recent activity */}
              <div className="relative z-10">
                <span className="font-mono text-[8.5px] tracking-[0.16em] uppercase text-cream/25 block mb-3">Recent Activity</span>
                <div className="space-y-2.5">
                  {[
                    { ticker: 'AAPL', name: 'Apple Inc.', chg: '+2.1%', price: '$187.23', up: true },
                    { ticker: 'MSFT', name: 'Microsoft', chg: '+0.8%', price: '$412.50', up: true },
                    { ticker: 'GOOGL', name: 'Alphabet', chg: '-0.3%', price: '$183.12', up: false },
                  ].map((s) => (
                    <div key={s.ticker} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-white/8 flex items-center justify-center shrink-0">
                          <span className="font-mono text-[7px] font-bold text-cream/55">{s.ticker[0]}</span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] font-bold text-cream/75 block leading-tight">{s.ticker}</span>
                          <span className="font-mono text-[8px] text-cream/28 leading-tight">{s.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono text-[10px] font-bold block leading-tight ${s.up ? 'text-mint' : 'text-[#e89a6a]'}`}>{s.chg}</span>
                        <span className="font-mono text-[9px] text-cream/35">{s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulator link */}
              <div className="mt-5 pt-4 border-t border-white/8 relative z-10">
                <Link href="/simulator" className="font-mono text-[9px] text-mint/70 hover:text-mint transition-colors">
                  Practice with our free market simulator →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROGRAMS
      ══════════════════════════════════════════ */}
      <section className="bg-cream dark:bg-[#1a1f1a] py-28 px-6 md:px-16 transition-colors duration-200" id="programs">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-14">
              <div>
                <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-3">Who We Serve</span>
                <h2 className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] font-black text-primary dark:text-[#e8f0e0] leading-[1.08] tracking-[-0.02em]">
                  Programs for<br />
                  <em className="not-italic text-primary-light dark:text-mint">every age.</em>
                </h2>
              </div>
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-primary-light dark:text-mint hover:text-primary dark:hover:text-cream transition-colors shrink-0 pb-1">
                View all courses <Arrow />
              </Link>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {programs.map((prog, idx) => (
              <RevealOnScroll key={prog.name} delay={idx * 0.08}>
                <div className="group relative bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-[20px] p-8 overflow-hidden hover:shadow-[0_20px_60px_rgba(43,66,36,0.12)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                  {/* Background number */}
                  <span className="absolute top-3 right-5 font-serif text-[7.5rem] font-black text-primary/[0.04] dark:text-mint/[0.04] leading-none select-none pointer-events-none group-hover:text-primary/[0.07] dark:group-hover:text-mint/[0.07] transition-colors duration-300">
                    {prog.num}
                  </span>
                  {/* Accent line */}
                  <div className={`h-[3px] w-10 ${prog.bar} rounded-full mb-6 group-hover:w-16 transition-all duration-300`} />
                  <span className="font-mono text-[9px] tracking-widest text-[#9ca3af] dark:text-[#6b7d65] uppercase block mb-3">{prog.age}</span>
                  <h3 className="font-serif text-xl font-black text-primary dark:text-[#e8f0e0] mb-3">{prog.name}</h3>
                  <p className="text-sm leading-relaxed text-[#6b7280] dark:text-[#8fa887] mb-6 flex-1">{prog.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.topics.map((t) => (
                      <span key={t} className="bg-primary/5 dark:bg-mint/8 text-sage dark:text-mint px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          IMPACT
      ══════════════════════════════════════════ */}
      <section className="bg-primary dark:bg-[#0d1209] py-28 px-6 md:px-16 relative overflow-hidden transition-colors duration-200">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(142,186,126,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_80%_50%,rgba(142,186,126,0.07)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative z-10 max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-20">
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-mint/50 block mb-4">Our Impact</span>
              <h2 className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] font-black text-cream leading-[1.08] tracking-[-0.02em]">
                Real change, measurable results.
              </h2>
            </div>
          </RevealOnScroll>

          {/* Counter row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 mb-20">
            {[
              { target: 1900, suffix: '+', label: 'People Reached', sub: 'across Texas and beyond' },
              { target: 83, suffix: '%', label: 'Retention Rate', sub: 'return for continued learning' },
              { target: 100, suffix: '%', label: 'Free Access', sub: 'no fees, no barriers, ever' },
            ].map((s) => (
              <RevealOnScroll key={s.label}>
                <div className="text-center py-10 px-8">
                  <div className="font-serif text-[clamp(3.5rem,6vw,5.2rem)] font-black text-cream leading-none mb-2">
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-mint font-bold text-sm mb-1">{s.label}</div>
                  <div className="font-mono text-[9.5px] text-cream/30 tracking-wide">{s.sub}</div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Pull quote */}
          <RevealOnScroll>
            <div className="max-w-[740px] mx-auto text-center border-t border-white/10 pt-16">
              <div className="font-serif text-5xl text-cream/15 leading-none mb-5 select-none">&quot;</div>
              <blockquote className="font-serif text-[clamp(1.2rem,2.5vw,1.85rem)] font-bold italic text-cream/85 leading-[1.45] mb-7">
                Financial literacy is the foundation of economic freedom. Every lesson we teach is an investment in someone&apos;s future.
              </blockquote>
              <Link href="/about" className="inline-flex items-center gap-2 text-mint font-bold text-sm hover:text-cream transition-colors">
                Read our full story <Arrow />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="bg-warm-white dark:bg-[#1a1f1a] py-28 px-6 md:px-16 transition-colors duration-200">
        <div className="max-w-[1020px] mx-auto">
          <RevealOnScroll>
            <div className="mb-16">
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-3">How It Works</span>
              <h2 className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] font-black text-primary dark:text-[#e8f0e0] leading-[1.08] tracking-[-0.02em]">
                Simple steps to<br />financial confidence.
              </h2>
            </div>
          </RevealOnScroll>

          <div className="relative">
            {/* Desktop connector */}
            <div className="hidden lg:block absolute top-9 left-9 right-9 h-px bg-gradient-to-r from-mint via-gold-light to-primary/20 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, idx) => (
                <RevealOnScroll key={step.num} delay={idx * 0.1}>
                  <div className="group flex flex-col items-start lg:items-center lg:text-center">
                    <div className="w-[72px] h-[72px] shrink-0 bg-white dark:bg-[#242924] border-2 border-mint/35 rounded-[18px] flex items-center justify-center mb-5 shadow-sm transition-all duration-300 group-hover:border-mint group-hover:bg-primary group-hover:shadow-[0_0_0_5px_rgba(142,186,126,0.12)] group-hover:-translate-y-1">
                      <span className="font-serif text-lg font-black text-primary dark:text-[#e8f0e0] group-hover:text-cream transition-colors duration-200">{step.num}</span>
                    </div>
                    <h3 className="font-bold text-sm text-primary dark:text-[#e8f0e0] mb-2 leading-snug">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-[#6b7280] dark:text-[#8fa887]">{step.desc}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GET INVOLVED
      ══════════════════════════════════════════ */}
      <section className="bg-cream dark:bg-[#1a1f1a] py-28 px-6 md:px-16 transition-colors duration-200">
        <div className="max-w-[1000px] mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-3">Get Involved</span>
              <h2 className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] font-black text-primary dark:text-[#e8f0e0] leading-[1.08] tracking-[-0.02em]">
                Be part of the change.
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RevealOnScroll delay={0.05}>
              <div className="group bg-primary dark:bg-[#111511] rounded-[20px] p-10 relative overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-lg hover:shadow-[0_24px_60px_rgba(43,66,36,0.28)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_80%_0%,rgba(142,186,126,0.1)_0%,transparent_60%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="h-[3px] w-10 bg-mint/50 rounded-full mb-6" />
                  <h3 className="font-serif text-2xl font-black text-cream mb-3">Donate</h3>
                  <p className="text-sm leading-relaxed text-cream/55 mb-8 max-w-[280px]">
                    Your gift funds free workshops, curriculum development, and access for underserved communities.
                  </p>
                  <Link
                    href="https://hcb.hackclub.com/donations/start/brightside-finance-foundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-mint hover:bg-mint/90 text-primary font-bold px-7 py-3.5 rounded-full text-sm inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  >
                    Give Today <Arrow />
                  </Link>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.12}>
              <div className="group bg-[#1e2819] dark:bg-[#242924] border border-mint/10 rounded-[20px] p-10 relative overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-lg hover:shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_100%,rgba(142,186,126,0.06)_0%,transparent_60%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="h-[3px] w-10 bg-primary-light/50 rounded-full mb-6" />
                  <h3 className="font-serif text-2xl font-black text-cream mb-3">Partner With Us</h3>
                  <p className="text-sm leading-relaxed text-cream/55 mb-8 max-w-[280px]">
                    Bring Brightside to your school, employer, or organization with custom workshops and speaking.
                  </p>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSen2UFMA_gdGVF7kvPtPgfNxZbdHvsN_FzYKXegj16Tz1ITDA/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-light hover:bg-sage text-cream font-bold px-7 py-3.5 rounded-full text-sm inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  >
                    Become a Partner <Arrow />
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════ */}
      <section className="bg-primary dark:bg-[#0d1209] py-20 px-6 md:px-16 relative overflow-hidden transition-colors duration-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_110%,rgba(142,186,126,0.07)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-[540px] mx-auto text-center">
          <RevealOnScroll>
            <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-mint/45 block mb-4">Stay Connected</span>
            <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.8rem)] font-black text-cream leading-[1.1] tracking-[-0.02em] mb-4">
              Money tips in your inbox.
            </h2>
            <p className="text-cream/45 text-sm leading-relaxed mb-8">
              Monthly insights, new resources, and financial tips — always free, never spam.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-grow px-5 py-4 border border-white/10 rounded-full text-sm outline-none bg-white/8 text-cream placeholder-cream/28 focus:border-mint/35 focus:bg-white/12 transition-all"
              />
              <button className="bg-mint hover:bg-mint/90 text-primary font-bold px-8 py-4 rounded-full text-sm transition-all hover:-translate-y-0.5 active:scale-[0.98] shrink-0 shadow-lg">
                Subscribe →
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

    </div>
  );
}
