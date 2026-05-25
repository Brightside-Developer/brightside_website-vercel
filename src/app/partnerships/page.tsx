'use client';

import React from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import RevealOnScroll from '@/components/RevealOnScroll';
import SectionHeader from '@/components/SectionHeader';

export default function Partnerships() {
  return (
    <div className="flex flex-col">
      {/* Page Hero */}
      <PageHero
        eyebrow="Our Partners"
        title={<>Together, we go <em className="text-rust dark:text-mint not-italic font-serif">further</em></>}
        description="We partner with organizations that share our mission of making financial literacy accessible to everyone. Together, we're building a financially confident future."
      />

      {/* Partners Section */}
      <section className="py-24 px-6 md:px-16 bg-warm-white dark:bg-[#1a1f1a] transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="// Our Partners"
              title="Organizations we work with"
              subtitle="Each partner brings unique expertise and community connections that amplify our impact."
              centered
            />
          </RevealOnScroll>

          <div className="flex justify-center flex-wrap gap-6 mt-12 max-w-[1000px] mx-auto">
            {/* Financial Freedom Initiative Card */}
            <RevealOnScroll className="w-full max-w-[480px]">
              <div className="bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                <div className="h-[180px] bg-gradient-to-br from-forest to-sage flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_30%,rgba(142,186,126,0.3)_0%,transparent_60%)]"></div>
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-white/15 backdrop-blur-[10px] border-2 border-white/25 flex items-center justify-center relative z-10 shadow-md">
                    <img
                      src="/financialfreedominitiative.jpg"
                      alt="Financial Freedom Initiative"
                      className="w-full h-full object-cover relative z-[1]"
                    />
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-primary dark:text-[#e8f0e0] mb-1">
                      Financial Freedom Initiative
                    </h3>
                    <div className="text-xs font-semibold text-sage dark:text-mint mb-3 uppercase tracking-wider">
                      NY
                    </div>
                    <p className="text-sm text-gray-500 dark:text-[#8fa887] leading-relaxed mb-6">
                      A nonprofit dedicated to providing financial coaching and mentorship programs for underserved youth across the southern United States.
                    </p>
                  </div>
                  <a
                    href="https://www.instagram.com/financial.freedom.initiative/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark dark:bg-mint dark:hover:bg-[#a8e097] text-white dark:text-charcoal font-semibold px-6 py-3 rounded-xl transition-all self-start text-xs shadow-sm hover:shadow-md active:scale-98"
                  >
                    <span>View Instagram</span>
                    <span className="text-[10px]">→</span>
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Become a Partner CTA Section */}
      <section className="py-24 px-6 md:px-16 bg-primary dark:bg-[#111511] text-cream text-center relative overflow-hidden transition-colors duration-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(142,186,126,0.15)_0%,transparent_60%)]"></div>
        <div className="relative z-10 max-w-[600px] mx-auto">
          <RevealOnScroll>
            <div className="flex flex-col items-center">
              <h2 className="font-serif text-[clamp(2.5rem,4vw,3.5rem)] font-black leading-tight text-cream mb-5">
                Become a partner
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-cream/70 dark:text-[#8fa887] mb-8 max-w-[500px]">
                Bring Brightside to your school, employer, or organization with custom workshops, resources, and collaborative programs.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSen2UFMA_gdGVF7kvPtPgfNxZbdHvsN_FzYKXegj16Tz1ITDA/viewform?usp=publish-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary hover:bg-secondary-light text-primary font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 text-sm"
                >
                  Partner With Us →
                </a>
                <Link
                  href="/about"
                  className="border border-cream/30 hover:border-cream hover:bg-white/10 text-cream font-bold px-8 py-3.5 rounded-xl transition-all active:scale-98 text-sm"
                >
                  Learn About Us
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
