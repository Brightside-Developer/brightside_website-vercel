'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeartPulse, 
  FaFileInvoiceDollar, 
  FaBuildingColumns, 
  FaReceipt, 
  FaShieldHalved,
  FaCheck,
  FaXmark,
  FaLightbulb,
  FaPhone,
  FaHandHoldingDollar,
  FaCreditCard,
  FaRegCommentDots,
  FaCircleCheck,
  FaChevronRight,
  FaCircleXmark,
  FaPercent,
  FaCircleInfo
} from 'react-icons/fa6';

import PageHero from '@/components/PageHero';
import RevealOnScroll from '@/components/RevealOnScroll';
import SectionHeader from '@/components/SectionHeader';

type PlanType = 'HMO' | 'PPO' | 'HDHP';

interface Term {
  word: string;
  definition: string;
  example: string;
}

export default function MedicalFinances() {
  // Plan Selection State
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('HMO');

  // Sticky Nav Active Tab Scroll Tracking
  const [activeTab, setActiveTab] = useState<string>('insurance');
  const isManualScrolling = useRef(false);

  // Bill Checklist State
  const [checkedItems, setCheckedItems] = useState<number[]>([0]); // Default first checked

  // Emergency Fund Calculator State
  const [deductible, setDeductible] = useState<number>(1600);
  const [oop, setOop] = useState<number>(6500);
  const [income, setIncome] = useState<number>(4000);
  
  // Calculate recommended medical emergency fund
  const recommendedFund = Math.max(deductible, Math.min(oop, income * 1.5));
  const resultSubText = recommendedFund <= deductible 
    ? 'Start here — this covers your deductible in an emergency' 
    : 'Your out-of-pocket max — the worst-case scenario fully covered';

  // Navigation Items
  const navSections = [
    { id: 'insurance', label: 'Health Insurance', icon: <FaHeartPulse /> },
    { id: 'debt', label: 'Medical Debt', icon: <FaFileInvoiceDollar /> },
    { id: 'hsa', label: 'HSA & FSA', icon: <FaBuildingColumns /> },
    { id: 'hospital', label: 'Hospital Bills', icon: <FaReceipt /> },
    { id: 'emergency', label: 'Emergency Savings', icon: <FaShieldHalved /> },
  ];

  // Key Terms
  const terms: Term[] = [
    {
      word: 'Premium',
      definition: 'Your monthly payment for insurance coverage, whether or not you use healthcare.',
      example: 'e.g. $280/month paid from your paycheck'
    },
    {
      word: 'Deductible',
      definition: 'What you pay before your insurance starts covering costs.',
      example: 'e.g. You pay first $1,500, then insurance kicks in'
    },
    {
      word: 'Copay',
      definition: 'A fixed amount you pay for a specific service, like a doctor visit.',
      example: 'e.g. $30 every time you see your PCP'
    },
    {
      word: 'Out-of-Pocket Max',
      definition: 'The most you\'ll ever pay in a year. After this, insurance covers 100%.',
      example: 'e.g. $6,500 max — then you pay nothing more'
    },
    {
      word: 'Coinsurance',
      definition: 'Your share of costs after meeting your deductible, expressed as a percentage.',
      example: 'e.g. 20% coinsurance — you pay $200 on a $1,000 bill'
    },
    {
      word: 'In-Network',
      definition: 'Doctors or facilities contracted with your insurance plan — far cheaper for you.',
      example: 'Always verify a provider is in-network before visiting'
    }
  ];

  // Checklist Items
  const checklistItems = [
    {
      label: 'Request the itemized bill',
      desc: 'Ask for a complete line-by-line breakdown — not just a summary. This is your legal right.'
    },
    {
      label: 'Compare bill to Explanation of Benefits',
      desc: 'Your EOB from insurance shows what should be covered. The numbers should align.'
    },
    {
      label: 'Check for duplicate charges',
      desc: 'Look for the same service billed more than once — common with daily room charges and lab tests.'
    },
    {
      label: 'Verify all providers were in-network',
      desc: 'Sometimes an out-of-network doctor operates inside an in-network hospital. Check each provider.'
    },
    {
      label: 'Look for upcoding errors',
      desc: 'Billed for a deluxe room when you had a standard one? A specialist when you saw a resident? These are billing errors.'
    },
    {
      label: 'Confirm services were actually received',
      desc: 'Patients are sometimes charged for services they didn\'t receive, especially during long stays.'
    },
    {
      label: 'Ask about financial assistance programs',
      desc: 'Before paying anything, ask if the hospital has charity care, sliding-scale fees, or hardship programs.'
    }
  ];

  // Scroll active tab detection
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrolling.current) return;
      const scrollPosition = window.scrollY + 160;

      for (const section of navSections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    isManualScrolling.current = true;
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.offsetTop - 140;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
    }
    // Release lock after scroll completes
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 800);
  };

  const toggleCheck = (idx: number) => {
    if (checkedItems.includes(idx)) {
      setCheckedItems(checkedItems.filter(item => item !== idx));
    } else {
      setCheckedItems([...checkedItems, idx]);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Page Hero */}
      <PageHero
        eyebrow="Medical Financial Literacy"
        title={<>Healthcare shouldn&apos;t cost you <em className="text-rust dark:text-mint not-italic">everything</em></>}
        description="Medical debt is the #1 cause of personal bankruptcy in America. Learn how to understand your coverage, dispute incorrect bills, leverage tax-free healthcare accounts, and build a robust medical safety net."
      />

      {/* Sticky Sub Nav */}
      <div className="sticky top-[72px] z-40 bg-white/90 dark:bg-charcoal/90 backdrop-blur-md border-b border-primary/5 dark:border-mint/10 py-1 transition-all duration-200">
        <div className="max-w-[1100px] mx-auto px-6 md:px-16 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {navSections.map((sect) => (
            <button
              key={sect.id}
              onClick={() => scrollToSection(sect.id)}
              className={`flex items-center gap-2 py-3.5 px-4 font-sans text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border-b-2 cursor-pointer ${
                activeTab === sect.id
                  ? 'text-primary border-rust dark:text-cream dark:border-mint font-bold'
                  : 'text-gray-400 border-transparent hover:text-primary dark:hover:text-cream'
              }`}
            >
              {sect.icon}
              <span>{sect.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stat Strip */}
      <div className="bg-rust dark:bg-[#111511] text-cream dark:text-mint py-6 px-6 md:px-16 border-b border-white/5 dark:border-mint/5 transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
          <div className="flex flex-col">
            <span className="font-serif text-3xl font-black md:text-4xl text-white dark:text-cream">1 in 5</span>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-cream/70 dark:text-mint/70 mt-1">Americans has medical debt</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/20 dark:bg-mint/15 mx-auto"></div>
          <div className="flex flex-col">
            <span className="font-serif text-3xl font-black md:text-4xl text-white dark:text-cream">$2,500</span>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-cream/70 dark:text-mint/70 mt-1">Avg unexpected medical bill</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/20 dark:bg-mint/15 mx-auto"></div>
          <div className="flex flex-col font-sans">
            <span className="font-serif text-3xl font-black md:text-4xl text-white dark:text-cream">67%</span>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-cream/70 dark:text-mint/70 mt-1">Bankruptcies tied to health costs</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/20 dark:bg-mint/15 mx-auto"></div>
          <div className="flex flex-col">
            <span className="font-serif text-3xl font-black md:text-4xl text-white dark:text-cream">$0</span>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-cream/70 dark:text-mint/70 mt-1">Cost to dispute a bill</span>
          </div>
        </div>
      </div>

      {/* HEALTH INSURANCE SECTION */}
      <section id="insurance" className="py-24 px-6 md:px-16 bg-warm-white dark:bg-[#1a1f1a] transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="01 — Health Insurance Basics"
              title="Understanding your coverage"
              subtitle="Health insurance can be confusing by design. Selecting the wrong plan can cost you thousands. Here is what you need to know before you choose."
            />
          </RevealOnScroll>

          {/* Plan Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 mt-8">
            {/* HMO Card */}
            <RevealOnScroll delay={0.05}>
              <div
                onClick={() => setSelectedPlan('HMO')}
                className={`group border-2 rounded-2xl p-6 bg-white dark:bg-[#242924] transition-all duration-300 cursor-pointer h-full relative ${
                  selectedPlan === 'HMO'
                    ? 'border-primary dark:border-mint shadow-md bg-primary/[0.01] dark:bg-mint/[0.01]'
                    : 'border-primary/5 dark:border-mint/10 hover:border-sage dark:hover:border-mint shadow-sm hover:shadow-md'
                }`}
              >
                {selectedPlan === 'HMO' && (
                  <span className="absolute top-4 right-4 text-primary dark:text-mint">
                    <FaCircleCheck className="text-xl" />
                  </span>
                )}
                <span className="font-serif text-4xl font-black text-primary dark:text-cream block mb-2">HMO</span>
                <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-3">Health Maintenance Organization</h4>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 mb-6">
                  Requires a primary care physician (PCP) and written referrals to see specialists. Lowest premiums, but least flexibility.
                </p>
                <div className="flex flex-col gap-2.5 border-t border-primary/5 dark:border-mint/10 pt-4">
                  <div className="flex gap-2 items-start text-xs text-sage dark:text-mint font-medium">
                    <FaCheck className="mt-0.5 shrink-0" />
                    <span>Lower monthly premiums</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-sage dark:text-mint font-medium">
                    <FaCheck className="mt-0.5 shrink-0" />
                    <span>Lower out-of-pocket costs</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-rust dark:text-rust font-medium">
                    <FaXmark className="mt-0.5 shrink-0" />
                    <span>Must stay in doctor network</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-rust dark:text-rust font-medium">
                    <FaXmark className="mt-0.5 shrink-0" />
                    <span>Requires specialist referrals</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* PPO Card */}
            <RevealOnScroll delay={0.1}>
              <div
                onClick={() => setSelectedPlan('PPO')}
                className={`group border-2 rounded-2xl p-6 bg-white dark:bg-[#242924] transition-all duration-300 cursor-pointer h-full relative ${
                  selectedPlan === 'PPO'
                    ? 'border-primary dark:border-mint shadow-md bg-primary/[0.01] dark:bg-mint/[0.01]'
                    : 'border-primary/5 dark:border-mint/10 hover:border-sage dark:hover:border-mint shadow-sm hover:shadow-md'
                }`}
              >
                {selectedPlan === 'PPO' && (
                  <span className="absolute top-4 right-4 text-primary dark:text-mint">
                    <FaCircleCheck className="text-xl" />
                  </span>
                )}
                <span className="font-serif text-4xl font-black text-primary dark:text-cream block mb-2">PPO</span>
                <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-3">Preferred Provider Organization</h4>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 mb-6">
                  Complete freedom to see any doctor — inside or outside your network — without any referral needed. High monthly premium cost.
                </p>
                <div className="flex flex-col gap-2.5 border-t border-primary/5 dark:border-mint/10 pt-4">
                  <div className="flex gap-2 items-start text-xs text-sage dark:text-mint font-medium">
                    <FaCheck className="mt-0.5 shrink-0" />
                    <span>See any doctor, no referrals</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-sage dark:text-mint font-medium">
                    <FaCheck className="mt-0.5 shrink-0" />
                    <span>Out-of-network coverage included</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-rust dark:text-rust font-medium">
                    <FaXmark className="mt-0.5 shrink-0" />
                    <span>Significantly higher premiums</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-rust dark:text-rust font-medium">
                    <FaXmark className="mt-0.5 shrink-0" />
                    <span>More complex claims paperwork</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* HDHP Card */}
            <RevealOnScroll delay={0.15}>
              <div
                onClick={() => setSelectedPlan('HDHP')}
                className={`group border-2 rounded-2xl p-6 bg-white dark:bg-[#242924] transition-all duration-300 cursor-pointer h-full relative ${
                  selectedPlan === 'HDHP'
                    ? 'border-primary dark:border-mint shadow-md bg-primary/[0.01] dark:bg-mint/[0.01]'
                    : 'border-primary/5 dark:border-mint/10 hover:border-sage dark:hover:border-mint shadow-sm hover:shadow-md'
                }`}
              >
                {selectedPlan === 'HDHP' && (
                  <span className="absolute top-4 right-4 text-primary dark:text-mint">
                    <FaCircleCheck className="text-xl" />
                  </span>
                )}
                <span className="font-serif text-4xl font-black text-primary dark:text-cream block mb-2">HDHP</span>
                <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-3">High-Deductible Health Plan</h4>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 mb-6">
                  Extremely low monthly payments but a high deductible to reach. Paired with a tax-sheltered HSA to accumulate healthcare funds.
                </p>
                <div className="flex flex-col gap-2.5 border-t border-primary/5 dark:border-mint/10 pt-4">
                  <div className="flex gap-2 items-start text-xs text-sage dark:text-mint font-medium">
                    <FaCheck className="mt-0.5 shrink-0" />
                    <span>Lowest monthly premium cost</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-sage dark:text-mint font-medium">
                    <FaCheck className="mt-0.5 shrink-0" />
                    <span>Triple tax-advantaged HSA eligible</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-rust dark:text-rust font-medium">
                    <FaXmark className="mt-0.5 shrink-0" />
                    <span>High individual deductible ($1,650+)</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-rust dark:text-rust font-medium">
                    <FaXmark className="mt-0.5 shrink-0" />
                    <span>High financial risk in emergencies</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Terms and Choosing Guide Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 mt-12 items-start">
            {/* Key Terms */}
            <RevealOnScroll>
              <div>
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-6">Key terms you must know</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {terms.map((term) => (
                    <div key={term.word} className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-5 hover:border-sage/40 transition-colors shadow-sm">
                      <h4 className="font-serif font-bold text-primary dark:text-cream text-base mb-1">{term.word}</h4>
                      <p className="text-xs text-gray-500 dark:text-[#8fa887] leading-relaxed mb-2">{term.definition}</p>
                      <span className="text-[10px] text-sage dark:text-mint font-bold italic block">{term.example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            {/* Choosing Steps */}
            <RevealOnScroll delay={0.1}>
              <div className="lg:pl-6">
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-6">How to choose your plan</h3>
                <div className="relative pl-8 flex flex-col gap-6">
                  {/* Vertical indicator line */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-mint via-gold to-sage/40 rounded-full"></div>
                  
                  <div className="relative flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-sage dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-sm">1</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-1">Estimate your annual healthcare usage</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-[#8fa887]">
                        Track your regular doctor visits, prescriptions, and any upcoming medical actions. History is the best predictor.
                      </p>
                    </div>
                  </div>

                  <div className="relative flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-sage dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-sm">2</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-1">Calculate total annual cost — not just premiums</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-[#8fa887]">
                        Formula: (Monthly Premium × 12) + Expected Out-of-Pocket costs. Cheap plans sometimes have massive deductibles.
                      </p>
                    </div>
                  </div>

                  <div className="relative flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-sage dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-sm">3</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-1">Verify that your doctors are in-network</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-[#8fa887]">
                        Before locking in any coverage plan, explicitly verify your preferred clinics and doctors participate in it.
                      </p>
                    </div>
                  </div>

                  <div className="relative flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-sage dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-sm">4</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-1">Assess the HDHP + HSA combo</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-[#8fa887]">
                        If you are young, relatively healthy, and have emergency reserves, an HDHP with a funded HSA provides stellar tax-free growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* MEDICAL DEBT SECTION */}
      <section id="debt" className="py-24 px-6 md:px-16 bg-cream dark:bg-[#111511] transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="02 — Managing Medical Debt"
              title="You have more power than you think"
              subtitle="Medical bills are frequently filled with mistakes, highly negotiable, and do not require immediate full payment. Here is your step-by-step negotiation protocol."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12 items-start">
            {/* Step-by-Step Vertical List */}
            <RevealOnScroll>
              <div>
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-8">Dispute Blueprint: When you get a major bill</h3>
                <div className="relative pl-8 flex flex-col gap-8">
                  {/* Timeline connector */}
                  <div className="absolute left-[20px] top-6 bottom-6 w-[2px] bg-rust/35 dark:bg-mint/20 rounded-full"></div>

                  {/* Step 1 */}
                  <div className="relative flex gap-6 items-start">
                    <div className="w-10 h-10 rounded-full bg-rust dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-black text-sm shrink-0 z-10 shadow-md">1</div>
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Do not pay it right away</h4>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-[#8fa887]">
                        Wait until you receive the Explanation of Benefits (EOB) from your insurance provider. Confirm they match perfectly.
                      </p>
                      <div className="flex items-start gap-2.5 bg-rust/5 border-l-2 border-rust dark:border-mint p-3 rounded-r-lg mt-3 text-xs text-rust dark:text-mint">
                        <FaLightbulb className="shrink-0 mt-0.5" />
                        <span>Paying a bill immediately can forfeit your legal rights to dispute billing errors.</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex gap-6 items-start">
                    <div className="w-10 h-10 rounded-full bg-rust dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-black text-sm shrink-0 z-10 shadow-md">2</div>
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Request an itemized billing sheet</h4>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-[#8fa887]">
                        Call the hospital billing department and ask for a complete line-item itemized receipt. Statistically, over 80% of medical bills have mistakes.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex gap-6 items-start">
                    <div className="w-10 h-10 rounded-full bg-rust dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-black text-sm shrink-0 z-10 shadow-md">3</div>
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Formally dispute any billing errors</h4>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-[#8fa887]">
                        Send written letters of dispute to both the hospital billing team and your insurance company citing code and receipt mismatch. Keep physical records.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex gap-6 items-start">
                    <div className="w-10 h-10 rounded-full bg-rust dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-black text-sm shrink-0 z-10 shadow-md">4</div>
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Negotiate a reduced payment structure</h4>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-[#8fa887]">
                        Most medical institutions accept 40% to 60% of the total amount if settled as a one-time cash payout. Ask if you can pay the Medicare rate.
                      </p>
                      <div className="flex items-start gap-2.5 bg-rust/5 border-l-2 border-rust dark:border-mint p-3 rounded-r-lg mt-3 text-xs text-rust dark:text-mint">
                        <FaLightbulb className="shrink-0 mt-0.5" />
                        <span>Non-profit hospitals are legally required to offer sliding-scale charity care. Ask for this explicitly.</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative flex gap-6 items-start">
                    <div className="w-10 h-10 rounded-full bg-rust dark:bg-mint text-white dark:text-charcoal flex items-center justify-center font-black text-sm shrink-0 z-10 shadow-md">5</div>
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Install an interest-free payment plan</h4>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-[#8fa887]">
                        If you cannot pay the full balance, arrange an interest-free payment schedule. Always choose this over carrying credit card debt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Patient Rights Cards */}
            <RevealOnScroll delay={0.15}>
              <div>
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-8 font-serif">Your core rights as a patient</h3>
                <div className="flex flex-col gap-4">
                  {/* Right 1 */}
                  <div className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-cream dark:bg-mint/10 rounded-xl shrink-0 flex items-center justify-center text-primary dark:text-mint font-serif font-black text-base">01</div>
                    <div>
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Right to complete itemization</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        Hospitals are legally required to furnish you with complete, line-by-line itemized breakdowns of all charges.
                      </p>
                    </div>
                  </div>

                  {/* Right 2 */}
                  <div className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-cream dark:bg-mint/10 rounded-xl shrink-0 flex items-center justify-center text-primary dark:text-mint font-serif font-black text-base">02</div>
                    <div>
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Surprise Billing Protections</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        Under the No Surprises Act (2022), you are protected against unexpected out-of-network costs incurred during in-network facility stays.
                      </p>
                    </div>
                  </div>

                  {/* Right 3 */}
                  <div className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-cream dark:bg-mint/10 rounded-xl shrink-0 flex items-center justify-center text-primary dark:text-mint font-serif font-black text-base">03</div>
                    <div>
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Right to insurance appeals</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        You can appeal any insurance coverage denial. Over 40% of standard appeals are won by the patient simply by pushing back.
                      </p>
                    </div>
                  </div>

                  {/* Right 4 */}
                  <div className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-cream dark:bg-mint/10 rounded-xl shrink-0 flex items-center justify-center text-primary dark:text-mint font-serif font-black text-base">04</div>
                    <div>
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Non-profit charity care programs</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        Non-profit facilities receive huge tax exemptions to support patient financial assistance. You might qualify even with middle-class income.
                      </p>
                    </div>
                  </div>

                  {/* Right 5 */}
                  <div className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-cream dark:bg-mint/10 rounded-xl shrink-0 flex items-center justify-center text-primary dark:text-mint font-serif font-black text-base">05</div>
                    <div>
                      <h4 className="font-sans font-bold text-base text-primary dark:text-cream mb-1">Patient advocacy assistance</h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        Free patient advocacy groups can represent you to audit and challenge bills. Reach out to nonprofit groups like Patient Advocate Foundation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* HSA / FSA ACCOUNTS SECTION */}
      <section id="hsa" className="py-24 px-6 md:px-16 bg-warm-white dark:bg-[#1a1f1a] transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="03 — HSA & FSA Accounts"
              title="Tax-free healthcare savings"
              subtitle="These specialized investment and savings accounts let you pay for eligible healthcare needs using pre-tax dollars — saving you between 20% and 37% depending on your tax bracket."
            />
          </RevealOnScroll>

          {/* HSA vs FSA Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-16">
            {/* HSA Card */}
            <RevealOnScroll>
              <div className="bg-primary dark:bg-[#111511] text-cream dark:text-mint rounded-[24px] p-8 shadow-lg relative overflow-hidden h-full border border-white/5 dark:border-mint/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_20%,rgba(142,186,126,0.1)_0%,transparent_60%)]"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-[#a8ac94] dark:text-[#8fa887] uppercase block mb-2">Health Savings Account</span>
                    <h3 className="font-serif text-3xl font-black text-gold-light dark:text-cream mb-2">HSA</h3>
                    <p className="text-xs text-cream/70 dark:text-[#8fa887] mb-6">Designed exclusively for individuals enrolled in High-Deductible Health Plans (HDHPs).</p>
                    
                    <div className="flex flex-col gap-3.5 mb-8">
                      <div className="flex gap-3 items-start text-xs text-cream/90 dark:text-[#e2e4d6]">
                        <FaCheck className="mt-0.5 shrink-0 text-mint" />
                        <span>Triple tax-advantaged: Tax-free deposits, tax-free growth, and tax-free withdrawals for medical bills.</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-cream/90 dark:text-[#e2e4d6]">
                        <FaCheck className="mt-0.5 shrink-0 text-mint" />
                        <span>Complete rollover: Funds never expire. The account acts as an investment vehicle for life.</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-cream/90 dark:text-[#e2e4d6]">
                        <FaCheck className="mt-0.5 shrink-0 text-mint" />
                        <span>Invests like a 401(k): Invest your balance in equity index funds for compounding growth.</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-cream/90 dark:text-[#e2e4d6]">
                        <FaCheck className="mt-0.5 shrink-0 text-mint" />
                        <span>Retirement bonus: Penalty-free withdrawals for any expense after age 65 (taxed like traditional IRA).</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-red-300 dark:text-red-400">
                        <FaXmark className="mt-0.5 shrink-0" />
                        <span>Contribution rules: You must be covered under an HDHP and have no other health insurance.</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 dark:border-mint/10 pt-6 mt-4">
                    <span className="font-serif text-2xl font-black text-gold-light dark:text-cream">$4,300 / $8,550</span>
                    <span className="text-[10px] uppercase tracking-wider block text-cream/65 dark:text-[#8fa887] mt-1">2025 contribution limits (individual / family)</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* FSA Card */}
            <RevealOnScroll delay={0.1}>
              <div className="bg-white dark:bg-[#242924] text-primary dark:text-[#e8f0e0] border border-primary/5 dark:border-mint/10 rounded-[24px] p-8 shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-[#a8ac94] dark:text-[#8fa887] uppercase block mb-2">Flexible Spending Account</span>
                    <h3 className="font-serif text-3xl font-black text-primary dark:text-cream mb-2">FSA</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mb-6">Offered as an employer-sponsored benefit option alongside traditional health coverage.</p>
                    
                    <div className="flex flex-col gap-3.5 mb-8">
                      <div className="flex gap-3 items-start text-xs text-gray-600 dark:text-gray-300">
                        <FaCheck className="mt-0.5 shrink-0 text-sage dark:text-mint" />
                        <span>Pre-tax contributions: Reduces your standard income tax liability on salary.</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-gray-600 dark:text-gray-300">
                        <FaCheck className="mt-0.5 shrink-0 text-sage dark:text-mint" />
                        <span>Universally compatible: Can be utilized with any HMO, PPO, or alternative medical coverage.</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-gray-600 dark:text-gray-300">
                        <FaCheck className="mt-0.5 shrink-0 text-sage dark:text-mint" />
                        <span>Fully pre-funded: Entire chosen annual contribution limit is ready to use on Day 1.</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-[#7a6b3a] dark:text-rust">
                        <FaXmark className="mt-0.5 shrink-0" />
                        <span>Use-it-or-lose-it: Leftover balances expire completely at year-end or grace period (no rollover).</span>
                      </div>
                      <div className="flex gap-3 items-start text-xs text-[#7a6b3a] dark:text-rust">
                        <FaXmark className="mt-0.5 shrink-0" />
                        <span>No asset investing: Balance must remain in high-liquidity cash format.</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-primary/5 dark:border-mint/10 pt-6 mt-4">
                    <span className="font-serif text-2xl font-black text-primary dark:text-cream">$3,300</span>
                    <span className="text-[10px] uppercase tracking-wider block text-gray-400 dark:text-gray-400 mt-1">2025 contribution limit</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Eligible items list */}
          <RevealOnScroll>
            <div>
              <h3 className="font-serif text-2xl font-black text-primary dark:text-cream text-center mb-8">What qualifies as tax-free?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Prescriptions & OTC Drugs',
                  'Glasses & Contact Lenses',
                  'Dental Care & Braces',
                  'Doctor Visit Copays',
                  'Lab Tests & Screenings',
                  'Splints, Wraps & Braces',
                  'Mental Health Therapy',
                  'Fertility Treatments',
                  'Vaccinations & Care'
                ].map((item) => (
                  <div key={item} className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-xl p-4 flex items-center justify-center font-sans font-bold text-xs text-primary dark:text-cream shadow-sm hover:scale-[1.02] hover:border-sage transition-all text-center">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* HOSPITAL BILL AUDITING SECTION */}
      <section id="hospital" className="py-24 px-6 md:px-16 bg-cream dark:bg-[#111511] transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="04 — Navigating Hospital Bills"
              title="Audit your bills before you pay a cent"
              subtitle="Up to four out of five medical bills contain diagnostic or billing errors. Work through our checklist and employ direct verbal templates to negotiate."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 mt-12 items-start">
            {/* Checklist */}
            <RevealOnScroll>
              <div>
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-6">Interactive audit checklist</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-sans">Click on each step below as you complete it during your billing audit.</p>
                <div className="flex flex-col gap-3">
                  {checklistItems.map((item, idx) => {
                    const isChecked = checkedItems.includes(idx);
                    return (
                      <div
                        key={item.label}
                        onClick={() => toggleCheck(idx)}
                        className={`group flex gap-4 items-start border rounded-xl p-4.5 bg-white dark:bg-[#242924] transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'border-sage dark:border-mint bg-sage/[0.01] dark:bg-mint/[0.01]'
                            : 'border-primary/5 dark:border-mint/10 hover:border-sage/40'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked
                            ? 'bg-sage border-sage dark:bg-mint dark:border-mint text-white dark:text-charcoal'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-sage'
                        }`}>
                          {isChecked && <FaCheck className="text-[10px]" />}
                        </div>
                        <div>
                          <h4 className={`font-sans font-bold text-sm leading-tight mb-1 transition-colors ${
                            isChecked ? 'text-primary dark:text-cream' : 'text-primary dark:text-cream'
                          }`}>
                            {item.label}
                          </h4>
                          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </RevealOnScroll>

            {/* Scripts and Tips */}
            <RevealOnScroll delay={0.15}>
              <div className="lg:pl-4">
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-8">Negotiation strategies that work</h3>
                <div className="flex flex-col gap-6">
                  {/* Tip 1 */}
                  <div className="bg-white dark:bg-[#242924] border-l-4 border-gold rounded-r-xl p-5 shadow-sm">
                    <h4 className="font-sans font-bold text-sm text-primary dark:text-cream flex items-center gap-2 mb-2">
                      <FaHandHoldingDollar className="text-gold text-base" />
                      <span>Request the cash pay rate discount</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      Facilities always charge inflated gross rates to insurers. If you pay out of pocket, request their lower self-pay cash discount rate.
                    </p>
                    <div className="bg-cream/40 dark:bg-charcoal/50 border border-primary/5 rounded-lg p-3 font-sans text-xs italic text-gray-600 dark:text-[#8fa887]">
                      &ldquo;I want to pay this medical bill, but I need to understand what prompt-pay or standard self-pay cash rate discounts you offer.&rdquo;
                    </div>
                  </div>

                  {/* Tip 2 */}
                  <div className="bg-white dark:bg-[#242924] border-l-4 border-gold rounded-r-xl p-5 shadow-sm">
                    <h4 className="font-sans font-bold text-sm text-primary dark:text-cream flex items-center gap-2 mb-2">
                      <FaPhone className="text-gold text-base" />
                      <span>Speak directly with Billing Managers</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      Customer support agents can rarely authorize massive settlement reductions. Escalate to supervisors or managers who possess write-off caps.
                    </p>
                    <div className="bg-cream/40 dark:bg-charcoal/50 border border-primary/5 rounded-lg p-3 font-sans text-xs italic text-gray-600 dark:text-[#8fa887]">
                      &ldquo;I would like to speak directly with an auditor or supervisor in billing to explore settlement options for this balance.&rdquo;
                    </div>
                  </div>

                  {/* Tip 3 */}
                  <div className="bg-white dark:bg-[#242924] border-l-4 border-gold rounded-r-xl p-5 shadow-sm">
                    <h4 className="font-sans font-bold text-sm text-primary dark:text-cream flex items-center gap-2 mb-2">
                      <FaCreditCard className="text-gold text-base" />
                      <span>Propose a finalized lump-sum offer</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      Institutions would rather collect 50% guaranteed today than carry unpaid balances into third-party collection cycles. Propose a lower lump sum.
                    </p>
                    <div className="bg-cream/40 dark:bg-charcoal/50 border border-primary/5 rounded-lg p-3 font-sans text-xs italic text-gray-600 dark:text-[#8fa887]">
                      &ldquo;I am prepared to pay a lump-sum of $[X] immediately to settle this account in full today. Can you authorize this settlement?&rdquo;
                    </div>
                  </div>

                  {/* Tip 4 */}
                  <div className="bg-white dark:bg-[#242924] border-l-4 border-gold rounded-r-xl p-5 shadow-sm">
                    <h4 className="font-sans font-bold text-sm text-primary dark:text-cream flex items-center gap-2 mb-2">
                      <FaRegCommentDots className="text-gold text-base" />
                      <span>Secure a 0% interest payment layout</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      Hospitals routinely configure custom interest-free payment timelines. Always select this route before charging medical debts to personal credit cards.
                    </p>
                    <div className="bg-cream/40 dark:bg-charcoal/50 border border-primary/5 rounded-lg p-3 font-sans text-xs italic text-gray-600 dark:text-[#8fa887]">
                      &ldquo;I need to establish a monthly payment schedule. Can we establish an interest-free payment plan of $[Y] per month?&rdquo;
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* EMERGENCY SAVINGS SECTION */}
      <section id="emergency" className="py-24 px-6 md:px-16 bg-warm-white dark:bg-[#1a1f1a] transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="05 — Medical Emergency Funds"
              title="Build your medical safety net"
              subtitle="The ultimate defense against medical bankruptcy is proactive savings. Design your liquidity reserves to shield against healthcare shocks."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-center">
            {/* Interactive Calculator */}
            <RevealOnScroll>
              <div className="bg-white dark:bg-[#242924] rounded-3xl p-8 border border-primary/5 dark:border-mint/10 shadow-lg max-w-[540px] mx-auto lg:mx-0">
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-6 flex items-center gap-2">
                  <FaShieldHalved className="text-sage dark:text-mint" />
                  <span>Emergency Fund Calculator</span>
                </h3>

                <div className="flex flex-col gap-5 mb-8">
                  {/* Deductible Field */}
                  <div className="flex flex-col">
                    <label className="font-sans font-bold text-xs uppercase tracking-wider text-primary dark:text-cream mb-2 flex items-center gap-1.5">
                      <span>Annual Deductible ($)</span>
                      <span className="group relative cursor-pointer text-gray-400 hover:text-primary transition-colors">
                        <FaCircleInfo />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-charcoal text-[10px] text-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity leading-normal z-50">
                          The amount you pay out-of-pocket before insurance starts paying.
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      value={deductible || ''}
                      onChange={(e) => setDeductible(Math.max(0, parseInt(e.target.value) || 0))}
                      className="border-2 border-primary/10 dark:border-mint/10 rounded-xl p-3 bg-transparent outline-none focus:border-sage dark:focus:border-mint text-sm font-bold text-primary dark:text-cream transition-colors"
                    />
                  </div>

                  {/* Out of pocket max Field */}
                  <div className="flex flex-col">
                    <label className="font-sans font-bold text-xs uppercase tracking-wider text-primary dark:text-cream mb-2 flex items-center gap-1.5">
                      <span>Out-of-Pocket Max ($)</span>
                      <span className="group relative cursor-pointer text-gray-400 hover:text-primary transition-colors">
                        <FaCircleInfo />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-charcoal text-[10px] text-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity leading-normal z-50">
                          The maximum total amount you can possibly pay for covered care in a plan year.
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      value={oop || ''}
                      onChange={(e) => setOop(Math.max(0, parseInt(e.target.value) || 0))}
                      className="border-2 border-primary/10 dark:border-mint/10 rounded-xl p-3 bg-transparent outline-none focus:border-sage dark:focus:border-mint text-sm font-bold text-primary dark:text-cream transition-colors"
                    />
                  </div>

                  {/* Monthly Income Field */}
                  <div className="flex flex-col">
                    <label className="font-sans font-bold text-xs uppercase tracking-wider text-primary dark:text-cream mb-2 flex items-center gap-1.5">
                      <span>Your Monthly Income ($)</span>
                      <span className="group relative cursor-pointer text-gray-400 hover:text-primary transition-colors">
                        <FaCircleInfo />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-charcoal text-[10px] text-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity leading-normal z-50">
                          Used to suggest a reasonable proportional liquid reserve buffer.
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      value={income || ''}
                      onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                      className="border-2 border-primary/10 dark:border-mint/10 rounded-xl p-3 bg-transparent outline-none focus:border-sage dark:focus:border-mint text-sm font-bold text-primary dark:text-cream transition-colors"
                    />
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="bg-primary dark:bg-charcoal text-cream rounded-2xl p-6 border border-white/5 dark:border-mint/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(142,186,126,0.1)_0%,transparent_60%)]"></div>
                  <div className="relative z-10">
                    <span className="font-mono text-[9px] tracking-wider uppercase text-gold-light/75 dark:text-mint/70 block mb-1">Recommended reserves</span>
                    <h4 className="font-serif text-4xl font-black text-gold-light dark:text-mint leading-none mb-3">
                      ${Math.round(recommendedFund).toLocaleString()}
                    </h4>
                    <p className="text-xs text-cream/70 dark:text-cream/80 leading-relaxed">{resultSubText}</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Strategic Advice */}
            <RevealOnScroll delay={0.15}>
              <div>
                <h3 className="font-serif text-2xl font-black text-primary dark:text-cream mb-8">How to build your safety net</h3>
                
                <div className="flex flex-col gap-5">
                  <div className="flex gap-4 items-start p-4 bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0 font-serif font-black text-sm text-primary-light dark:text-mint">01</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-0.5">Deductible is Milestone #1</h4>
                      <p className="text-xs text-gray-500 dark:text-[#8fa887] leading-relaxed">
                        If saving the entire Out-of-Pocket Max feels out of reach, anchor your initial target strictly to your plan&apos;s Deductible.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0 font-serif font-black text-sm text-primary-light dark:text-mint">02</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-0.5">Leverage an HSA first</h4>
                      <p className="text-xs text-gray-500 dark:text-[#8fa887] leading-relaxed">
                        If you have an HDHP, prioritize funding your HSA to max out pre-tax savings benefits.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0 font-serif font-black text-sm text-primary-light dark:text-mint">03</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-0.5">Automate monthly micro-transfers</h4>
                      <p className="text-xs text-gray-500 dark:text-[#8fa887] leading-relaxed">
                        Set up a recurring sweep of even $25 or $50 per pay cycle into a High-Yield Savings Account dedicated to healthcare.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0 font-serif font-black text-sm text-primary-light dark:text-mint">04</div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-primary dark:text-cream mb-0.5">Invest HSA funds beyond cash targets</h4>
                      <p className="text-xs text-gray-500 dark:text-[#8fa887] leading-relaxed">
                        Once you establish your annual deductible in cash inside the HSA, invest the remaining surplus into stock indices for tax-free compounding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

    </div>
  );
}
