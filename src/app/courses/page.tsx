'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import RevealOnScroll from '@/components/RevealOnScroll';
import { AnimatePresence, motion } from 'framer-motion';

interface Module {
  num: string;
  title: string;
  desc: string;
  lessons: string[];
  type: string;
}

interface Program {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  tagClass: string;
  stats: string;
  media: string;
  themeClass: string;
  headerBg: string;
  iconBg: string;
  dotBg: string;
  typeBg: string;
  typeText: string;
  accentColor: string;
  modules: Module[];
}

export default function Courses() {
  const [activeTab, setActiveTab] = useState<'kids' | 'teens' | 'adults'>('kids');

  const programs: Program[] = [
    {
      id: 'kids',
      name: 'Money Sprouts',
      shortName: 'Money Sprouts',
      tag: 'Elementary School · Ages 5–10',
      tagClass: 'tag-mint dark:bg-mint/20 dark:text-mint',
      stats: '8 modules · 24 lessons',
      media: 'Video + Activities',
      themeClass: 'theme-kids',
      headerBg: 'border-mint/20 dark:border-mint/10',
      iconBg: 'bg-mint/15 dark:bg-mint/25',
      dotBg: 'bg-mint dark:bg-mint',
      typeBg: 'bg-mint/12 dark:bg-mint/15',
      typeText: 'text-sage dark:text-mint',
      accentColor: 'mint',
      modules: [
        {
          num: 'MODULE 01',
          title: 'What Is Money?',
          desc: 'Understanding where money comes from, how we earn it, and why we use it instead of trading.',
          lessons: ['Where does money come from?', 'Coins & bills — what\'s the difference?', 'A short history of money'],
          type: 'Story + Activity',
        },
        {
          num: 'MODULE 02',
          title: 'Earning & Working',
          desc: 'How people earn money through jobs, chores, and creative work — and why effort matters.',
          lessons: ['Jobs people do', 'Getting paid for chores', 'Making vs. buying things'],
          type: 'Video + Quiz',
        },
        {
          num: 'MODULE 03',
          title: 'Saving in Jars',
          desc: 'The three-jar system: Spend, Save, and Give. Building the habit of saving from day one.',
          lessons: ['Meet the three jars', 'Setting a savings goal', 'Tracking your progress'],
          type: 'Hands-On Activity',
        },
        {
          num: 'MODULE 04',
          title: 'Needs vs. Wants',
          desc: 'The most important money concept — learning to tell the difference between what we need and what we want.',
          lessons: ['What do we really need?', 'Wants can wait', 'Making smart choices at the store'],
          type: 'Story + Activity',
        },
        {
          num: 'MODULE 05',
          title: 'The Giving Jar',
          desc: 'Why sharing and giving is a part of good money management — and how generosity makes communities stronger.',
          lessons: ['Why we give', 'Choosing a cause you care about', 'Giving your time, not just money'],
          type: 'Discussion',
        },
        {
          num: 'MODULE 06',
          title: 'My First Goal',
          desc: 'Setting a real savings goal and making a simple plan to reach it — with a celebration at the end!',
          lessons: ['Choosing your goal', 'Making a saving plan', 'Celebrating milestones'],
          type: 'Project',
        },
      ],
    },
    {
      id: 'teens',
      name: 'Smart Start',
      shortName: 'Smart Start',
      tag: 'Middle & High School · Ages 11–18',
      tagClass: 'tag-gold dark:bg-gold/20 dark:text-gold-light',
      stats: '10 modules · 35 lessons',
      media: 'Video + Worksheets',
      themeClass: 'theme-teens',
      headerBg: 'border-gold/20 dark:border-gold/10',
      iconBg: 'bg-gold/15 dark:bg-gold/25',
      dotBg: 'bg-gold dark:bg-gold',
      typeBg: 'bg-gold/12 dark:bg-gold/15',
      typeText: 'text-[#8a6a10] dark:text-gold-light',
      accentColor: 'gold',
      modules: [
        {
          num: 'MODULE 01',
          title: 'Your First Paycheck',
          desc: 'Breaking down taxes, deductions, and net vs. gross pay so your first job isn\'t a surprise.',
          lessons: ['Gross vs. net pay', 'Understanding tax withholding', 'Reading a pay stub'],
          type: 'Video + Calculator',
        },
        {
          num: 'MODULE 02',
          title: 'Teen Budgeting 101',
          desc: 'Creating a simple budget for a teen\'s income — allowance, jobs, and birthday money all count.',
          lessons: ['What is a budget?', 'Fixed vs. flexible spending', 'Building your first budget'],
          type: 'Worksheet',
        },
        {
          num: 'MODULE 03',
          title: 'Credit — The Basics',
          desc: 'What credit is, why it matters, and how the decisions you make now can affect you for years.',
          lessons: ['What is a credit score?', 'Good debt vs. bad debt', 'Building credit at 18'],
          type: 'Video + Quiz',
        },
        {
          num: 'MODULE 04',
          title: 'Banking & Accounts',
          desc: 'Opening your first bank account, understanding checking vs. savings, and avoiding fees.',
          lessons: ['Checking vs. savings accounts', 'How to avoid bank fees', 'Digital banking & apps'],
          type: 'Interactive',
        },
        {
          num: 'MODULE 05',
          title: 'College & Money',
          desc: 'FAFSA, scholarships, student loans, and how to avoid graduating with crushing debt.',
          lessons: ['Filling out FAFSA', 'Scholarships vs. loans', 'Understanding student loan interest'],
          type: 'Guide + Worksheet',
        },
        {
          num: 'MODULE 06',
          title: 'Smart Shopping',
          desc: 'Comparison shopping, avoiding impulse buys, and understanding marketing tricks designed to separate you from your money.',
          lessons: ['How advertising works', 'Comparison shopping strategies', 'The 24-hour rule'],
          type: 'Activity',
        },
      ],
    },
    {
      id: 'adults',
      name: 'Financial Foundations',
      shortName: 'Financial Foundations',
      tag: 'Adults · Ages 18+',
      tagClass: 'tag-rust dark:bg-rust/20 dark:text-rust',
      stats: '6 modules · 24 lessons',
      media: 'Video + Tools',
      themeClass: 'theme-adults',
      headerBg: 'border-primary/20 dark:border-mint/10',
      iconBg: 'bg-primary/8 dark:bg-mint/15',
      dotBg: 'bg-sage dark:bg-mint',
      typeBg: 'bg-primary/5 dark:bg-mint/8',
      typeText: 'text-sage dark:text-mint',
      accentColor: 'primary',
      modules: [
        {
          num: 'MODULE 01',
          title: 'Adult Budgeting',
          desc: 'The 50/30/20 rule and zero-based budgeting — which method fits your life and income?',
          lessons: ['50/30/20 rule explained', 'Zero-based budgeting', 'Budgeting apps compared'],
          type: 'Calculator Tool',
        },
        {
          num: 'MODULE 02',
          title: 'Emergency Fund',
          desc: 'Why 3–6 months of expenses is your most important financial foundation — and how to build it fast.',
          lessons: ['What counts as an emergency?', 'Where to keep your fund', 'Building it on a tight budget'],
          type: 'Video + Worksheet',
        },
        {
          num: 'MODULE 03',
          title: 'Renting vs. Buying',
          desc: 'Is homeownership right for you? Understanding mortgages, down payments, and the true cost of owning.',
          lessons: ['The real cost of renting', 'Mortgage basics', 'When buying makes sense'],
          type: 'Calculator Tool',
        },
        {
          num: 'MODULE 04',
          title: 'Tackling Debt',
          desc: 'Snowball vs. avalanche — two proven strategies for paying off debt and getting free faster.',
          lessons: ['Debt snowball method', 'Debt avalanche method', 'Negotiating lower interest rates'],
          type: 'Payoff Calculator',
        },
        {
          num: 'MODULE 05',
          title: 'Investing 101',
          desc: 'Index funds, compound interest, and why starting early is the greatest financial advantage you have.',
          lessons: ['Stocks, bonds, and funds', 'The power of compound interest', 'Opening your first brokerage'],
          type: 'Video + Simulator',
        },
        {
          num: 'MODULE 06',
          title: 'Retirement Planning',
          desc: 'Understanding 401(k)s, IRAs, employer matches, and how to plan confidently for the future.',
          lessons: ['What is a 401(k)?', 'Roth vs. Traditional IRA', 'Maximizing your employer match'],
          type: 'Guide',
        },
      ],
    },
  ];

  const outcomes = [
    'Build and stick to a monthly budget',
    'Understand your credit score and improve it',
    'Open and manage a savings account',
    'Start an emergency fund from scratch',
    'Understand investing and compound growth',
    'Navigate health insurance and medical bills',
    'Create a debt payoff strategy',
    'Plan confidently for retirement',
  ];

  const activeProgram = programs.find((p) => p.id === activeTab)!;
  const activeIdx = programs.findIndex((p) => p.id === activeTab);

  return (
    <div className="flex flex-col bg-warm-white dark:bg-[#1a1f1a]">
      {/* --- HERO --- */}
      <PageHero
        eyebrow="Full Curriculum"
        title={<>Three programs. <em>One mission.</em></>}
        description="Every Brightside curriculum is built by certified educators and financial professionals, designed for the real money challenges people face at each stage of life."
      />

      {/* --- WIP BANNER --- */}
      <div className="px-6 md:px-16 pt-10 pb-0">
        <div className="max-w-[1200px] mx-auto">
          <div className="p-5 bg-yellow-500/8 dark:bg-yellow-500/5 border border-dashed border-yellow-600/35 rounded-2xl flex gap-4 items-start">
            <span className="font-mono text-[10px] tracking-widest font-bold text-yellow-700 dark:text-yellow-500 bg-yellow-500/15 rounded px-2 py-1 shrink-0 mt-0.5">WIP</span>
            <div>
              <h4 className="font-serif text-sm font-bold text-primary dark:text-[#e8f0e0] mb-0.5">Curriculum Coming Soon</h4>
              <p className="text-xs leading-relaxed text-[#6b7280] dark:text-[#8fa887]">
                Our team is actively building out the full lesson content. Check back soon — modules and lessons will be rolling out shortly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="px-6 md:px-16 py-12 pb-24">
        <div className="max-w-[1200px] mx-auto">

          {/* Mobile tab strip */}
          <div className="lg:hidden mb-8">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {programs.map((prog, i) => (
                <button
                  key={prog.id}
                  onClick={() => setActiveTab(prog.id as 'kids' | 'teens' | 'adults')}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 shrink-0 ${
                    activeTab === prog.id
                      ? 'bg-primary dark:bg-primary-light text-cream shadow-sm'
                      : 'bg-white dark:bg-[#242924] text-primary dark:text-[#e8f0e0] border border-primary/10 dark:border-mint/10 hover:border-primary/25 dark:hover:border-mint/25'
                  }`}
                >
                  <span className={`font-mono text-[10px] font-bold ${activeTab === prog.id ? 'text-cream/60' : 'text-[#9ca3af] dark:text-[#6b7d65]'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {prog.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: sidebar + content */}
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10 lg:items-start">

            {/* Sidebar nav */}
            <aside className="hidden lg:block sticky top-[88px]">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#9ca3af] dark:text-[#6b7d65] mb-3 px-4">Programs</span>
                {programs.map((prog, i) => {
                  const isActive = activeTab === prog.id;
                  return (
                    <button
                      key={prog.id}
                      onClick={() => setActiveTab(prog.id as 'kids' | 'teens' | 'adults')}
                      className={`group relative flex items-start gap-3.5 px-4 py-4 rounded-xl text-left cursor-pointer transition-all duration-200 mb-1 ${
                        isActive
                          ? 'bg-primary dark:bg-[#1e2b1c] shadow-sm'
                          : 'hover:bg-primary/5 dark:hover:bg-mint/5'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-mint rounded-r-full" />
                      )}
                      <span className={`font-mono text-[11px] font-bold mt-0.5 shrink-0 transition-colors ${
                        isActive ? 'text-mint' : 'text-[#9ca3af] dark:text-[#6b7d65] group-hover:text-primary-light dark:group-hover:text-mint'
                      }`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className={`font-bold text-sm mb-0.5 transition-colors leading-tight ${
                          isActive ? 'text-cream' : 'text-primary dark:text-[#e8f0e0]'
                        }`}>
                          {prog.name}
                        </div>
                        <div className={`text-[11px] leading-snug transition-colors ${
                          isActive ? 'text-cream/55' : 'text-[#9ca3af] dark:text-[#6b7d65]'
                        }`}>
                          {prog.tag}
                        </div>
                        <div className={`font-mono text-[10px] mt-1.5 transition-colors ${
                          isActive ? 'text-mint/80' : 'text-[#9ca3af] dark:text-[#6b7d65]'
                        }`}>
                          {prog.stats}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="mt-5 px-4 pt-5 border-t border-primary/8 dark:border-mint/8">
                  <Link
                    href="/auth"
                    className="w-full flex items-center justify-center gap-2 bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-xs py-3 rounded-full transition-all hover:shadow-md"
                  >
                    Start Learning Free
                  </Link>
                </div>
              </div>
            </aside>

            {/* Program content */}
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProgram.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {/* Program header */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-7 mb-8 border-b ${activeProgram.headerBg}`}>
                    <div className="flex gap-4 items-center">
                      <div className={`w-[60px] h-[60px] rounded-[16px] flex items-center justify-center shrink-0 shadow-sm ${activeProgram.iconBg}`}>
                        <span className="font-serif text-xl font-black text-primary-light dark:text-mint">
                          {String(activeIdx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0] mb-1.5 leading-none">
                          {activeProgram.name}
                        </h2>
                        <div className="flex gap-2.5 flex-wrap items-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary/5 ${activeProgram.tagClass}`}>
                            {activeProgram.tag}
                          </span>
                          <span className="text-xs text-[#6b7280] dark:text-[#8fa887] font-medium">
                            {activeProgram.media}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="sm:shrink-0">
                      <Link
                        href="/auth"
                        className="bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-xs px-6 py-3 rounded-full inline-block shadow-sm transition-all hover:-translate-y-0.5"
                      >
                        Start This Program →
                      </Link>
                    </div>
                  </div>

                  {/* Modules grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {activeProgram.modules.map((mod) => (
                      <div
                        key={mod.num}
                        className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div>
                          <span className="font-mono text-[9px] tracking-widest text-[#9ca3af] dark:text-[#6b7d65] uppercase block mb-2.5">
                            {mod.num}
                          </span>
                          <h3 className="font-bold text-base text-primary dark:text-[#e8f0e0] mb-2">
                            {mod.title}
                          </h3>
                          <p className="text-xs leading-relaxed text-[#6b7280] dark:text-[#8fa887] mb-5">
                            {mod.desc}
                          </p>
                          <div className="flex flex-col gap-2">
                            {mod.lessons.map((lesson) => (
                              <div key={lesson} className="flex gap-2.5 items-center text-xs text-[#4a5568] dark:text-[#8fa887]">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeProgram.dotBg}`} />
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-primary/5 dark:border-mint/5 pt-4 mt-6">
                          <span className="font-mono text-[10px] tracking-wider text-[#9ca3af] dark:text-[#6b7d65]">
                            {mod.lessons.length} LESSONS
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${activeProgram.typeBg} ${activeProgram.typeText}`}>
                            {mod.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prev / Next navigation */}
                  <div className="flex justify-between items-center mt-10 pt-6 border-t border-primary/8 dark:border-mint/8">
                    <button
                      onClick={() => {
                        const prev = programs[activeIdx - 1];
                        if (prev) setActiveTab(prev.id as 'kids' | 'teens' | 'adults');
                      }}
                      disabled={activeIdx === 0}
                      className="flex items-center gap-2 text-xs font-semibold text-primary dark:text-[#e8f0e0] disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary-light dark:hover:text-mint transition-colors cursor-pointer"
                    >
                      ← {activeIdx > 0 ? programs[activeIdx - 1].name : 'Previous'}
                    </button>
                    <div className="flex gap-1.5">
                      {programs.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => setActiveTab(p.id as 'kids' | 'teens' | 'adults')}
                          className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                            p.id === activeTab ? 'bg-primary dark:bg-mint w-5' : 'bg-primary/20 dark:bg-mint/20 hover:bg-primary/40 dark:hover:bg-mint/40'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const next = programs[activeIdx + 1];
                        if (next) setActiveTab(next.id as 'kids' | 'teens' | 'adults');
                      }}
                      disabled={activeIdx === programs.length - 1}
                      className="flex items-center gap-2 text-xs font-semibold text-primary dark:text-[#e8f0e0] disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary-light dark:hover:text-mint transition-colors cursor-pointer"
                    >
                      {activeIdx < programs.length - 1 ? programs[activeIdx + 1].name : 'Next'} →
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* --- OUTCOMES SECTION --- */}
      <section className="bg-cream dark:bg-[#111511] py-24 px-6 md:px-16 transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-16 items-start">
          <RevealOnScroll>
            <div>
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary-light dark:text-[#6b9960] block mb-3">
                {'// What You\'ll Gain'}
              </span>
              <h2 className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-black text-primary dark:text-[#e8f0e0] leading-[1.15] mb-5">
                Real skills, real results
              </h2>
              <p className="text-[#576455] dark:text-[#8fa887] text-base leading-relaxed mb-8 max-w-[420px]">
                Our curriculum is outcomes-driven. Every module is designed around a concrete skill you can use immediately.
              </p>
              <Link
                href="/auth"
                className="bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-semibold px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-md active:scale-98"
              >
                Start Learning Free →
              </Link>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outcomes.map((item) => (
                <div
                  key={item}
                  className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-5 flex gap-3.5 items-start shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-[28px] h-[28px] bg-mint/15 dark:bg-mint/20 rounded-lg flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint dark:bg-mint" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-primary dark:text-[#e8f0e0] leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
