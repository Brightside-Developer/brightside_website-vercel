'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaLocationDot, FaXmark } from 'react-icons/fa6';

import PageHero from '@/components/PageHero';
import SectionHeader from '@/components/SectionHeader';
import RevealOnScroll from '@/components/RevealOnScroll';
import USMap, { StatePathData, statePaths } from '@/components/USMap';

interface Chapter {
  code: string;
  name: string;
  stateName: string;
  location: string;
  desc: string;
  city: string;
}

const activeChaptersList: Chapter[] = [
  {
    code: 'TX',
    name: 'Houston Chapter',
    stateName: 'Texas',
    location: 'Houston, Texas',
    desc: 'Serving the greater Houston metropolitan area with financial literacy workshops and community events.',
    city: 'Houston',
  },
  {
    code: 'NJ',
    name: 'New Jersey Chapter',
    stateName: 'New Jersey',
    location: 'New Jersey',
    desc: 'Bringing financial education to communities across the Garden State.',
    city: 'Trenton',
  },
  {
    code: 'GA',
    name: 'Atlanta Chapter',
    stateName: 'Georgia',
    location: 'Atlanta, Georgia',
    desc: 'Empowering Atlanta communities with essential money management skills.',
    city: 'Atlanta',
  },
  {
    code: 'IL',
    name: 'Chicago Chapter',
    stateName: 'Illinois',
    location: 'Chicago, Illinois',
    desc: 'Providing accessible financial literacy resources and mentorship programs to the Windy City.',
    city: 'Chicago',
  },
];

export default function Chapters() {
  const [selectedState, setSelectedState] = useState<StatePathData | null>(null);
  const [isHQSelected, setIsHQSelected] = useState<boolean>(false);

  const closePanel = () => {
    setSelectedState(null);
    setIsHQSelected(false);
  };

  const handleStateSelect = (stateData: StatePathData, _e: React.MouseEvent<SVGPathElement>) => {
    if (selectedState?.code === stateData.code) {
      closePanel();
    } else {
      setSelectedState(stateData);
      setIsHQSelected(false);
    }
  };

  const handleHQSelect = (_e: React.MouseEvent) => {
    if (isHQSelected) {
      closePanel();
    } else {
      setIsHQSelected(true);
      setSelectedState(null);
    }
  };

  const selectChapterState = (code: string) => {
    const sp = statePaths.find(s => s.code === code && s.name);
    if (sp) {
      setSelectedState(sp);
      setIsHQSelected(false);
    }
  };

  const matchingChapter = selectedState
    ? activeChaptersList.find(c => c.code === selectedState.code)
    : null;

  const panelKey = isHQSelected ? 'hq' : selectedState ? selectedState.code : 'default';

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <PageHero
        eyebrow="Our Chapters"
        title={<>Brightside is <em className="text-rust dark:text-mint not-italic">growing nationwide</em></>}
        description="We're building a network of local chapters across the United States, bringing financial literacy education directly into communities."
      />

      {/* Interactive Map Section */}
      <section className="py-20 px-6 md:px-16 bg-warm-white dark:bg-[#1a1f1a] transition-colors duration-200">
        <RevealOnScroll>
          <SectionHeader
            label="// Explore the Map"
            title="Find a chapter near you"
            subtitle="Click any state to see if there's a Brightside chapter in your area."
            centered
          />
        </RevealOnScroll>

        <div className="max-w-[1300px] mx-auto mt-10">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* ── MAP COLUMN ── */}
            <div>
              <RevealOnScroll delay={0.05}>
                <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[24px] p-4 md:p-6 shadow-sm">
                  <USMap
                    selectedStateCode={selectedState?.code || null}
                    onStateSelect={handleStateSelect}
                    onHQSelect={handleHQSelect}
                    activeChapterCodes={activeChaptersList.map(c => c.code)}
                    isHQSelected={isHQSelected}
                  />
                </div>
              </RevealOnScroll>

              {/* Legend */}
              <div className="flex gap-6 mt-5 px-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#9ca3af] dark:text-[#6b7d65]">
                  <span className="w-3 h-3 rounded-sm bg-mint inline-block shrink-0" />
                  Active Chapter
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#9ca3af] dark:text-[#6b7d65]">
                  <span className="w-3 h-3 rounded-sm bg-primary/12 dark:bg-[#2a332a] border border-primary/10 dark:border-mint/15 inline-block shrink-0" />
                  No chapter yet
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#9ca3af] dark:text-[#6b7d65]">
                  <span className="w-3 h-3 rounded-sm bg-primary/40 dark:bg-mint/40 inline-block shrink-0" />
                  Headquarters
                </div>
              </div>
            </div>

            {/* ── DETAIL PANEL ── */}
            <div className="lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={panelKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[24px] shadow-sm overflow-hidden"
                >

                  {/* ── DEFAULT: chapter directory ── */}
                  {!selectedState && !isHQSelected && (
                    <div className="p-7">
                      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#9ca3af] dark:text-[#6b7d65] block mb-3">
                        Active Chapters
                      </span>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="font-serif text-5xl font-black text-primary dark:text-[#e8f0e0]">
                          {activeChaptersList.length}
                        </span>
                        <span className="text-sm text-[#9ca3af] dark:text-[#6b7d65] font-medium">
                          chapters nationwide
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 mb-7">
                        {activeChaptersList.map(c => (
                          <button
                            key={c.code}
                            onClick={() => selectChapterState(c.code)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 dark:hover:bg-mint/5 transition-colors text-left cursor-pointer group w-full"
                          >
                            <span className="font-mono text-[11px] font-bold text-primary-light dark:text-mint w-7 shrink-0">
                              {c.code}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-primary dark:text-[#e8f0e0] group-hover:text-primary-light dark:group-hover:text-mint transition-colors truncate">
                                {c.name}
                              </div>
                              <div className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65]">{c.city}</div>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-mint shrink-0" />
                          </button>
                        ))}
                      </div>

                      <div className="pt-5 border-t border-primary/6 dark:border-mint/8">
                        <p className="text-xs text-[#9ca3af] dark:text-[#6b7d65] mb-4 leading-relaxed">
                          Click any state on the map to explore, or start a chapter in your area.
                        </p>
                        <a
                          href="https://docs.google.com/forms/d/e/1FAIpQLSe_3yaltwL4w-Gu_6H5LtnL9EASQ1pzO48w6ZcTtn8820-UgA/viewform?usp=header"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm"
                        >
                          Start a Chapter <FaArrowRight className="text-[10px]" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ── HQ SELECTED ── */}
                  {isHQSelected && (
                    <div className="p-7">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#9ca3af] dark:text-[#6b7d65]">
                          Headquarters
                        </span>
                        <button
                          onClick={closePanel}
                          className="w-7 h-7 rounded-full bg-primary/5 dark:bg-mint/10 flex items-center justify-center text-[#9ca3af] dark:text-[#6b7d65] hover:bg-primary/10 dark:hover:bg-mint/20 transition-colors cursor-pointer shrink-0"
                        >
                          <FaXmark className="text-xs" />
                        </button>
                      </div>

                      <h3 className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0] mb-2 leading-tight">
                        Brightside Headquarters
                      </h3>
                      <div className="inline-flex items-center gap-1.5 bg-primary/8 dark:bg-mint/10 text-primary-light dark:text-mint px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-mint animate-pulse" />
                        Dallas, TX
                      </div>

                      <p className="text-xs text-[#6b7280] dark:text-[#8fa887] leading-relaxed mb-6">
                        Our national headquarters in Dallas coordinates financial literacy programs, chapter operations, and partnerships across the country.
                      </p>

                      <a
                        href="mailto:brightsidefinance@gmail.com"
                        className="inline-flex items-center gap-2 bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm"
                      >
                        Contact HQ <FaArrowRight className="text-[10px]" />
                      </a>
                    </div>
                  )}

                  {/* ── STATE SELECTED ── */}
                  {selectedState && (
                    <div className="p-7">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#9ca3af] dark:text-[#6b7d65]">
                          {matchingChapter ? 'Active Chapter' : 'No Chapter Yet'}
                        </span>
                        <button
                          onClick={closePanel}
                          className="w-7 h-7 rounded-full bg-primary/5 dark:bg-mint/10 flex items-center justify-center text-[#9ca3af] dark:text-[#6b7d65] hover:bg-primary/10 dark:hover:bg-mint/20 transition-colors cursor-pointer shrink-0"
                        >
                          <FaXmark className="text-xs" />
                        </button>
                      </div>

                      <h3 className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0] mb-4 leading-tight">
                        {selectedState.name}
                      </h3>

                      {matchingChapter ? (
                        <>
                          <div className="inline-flex items-center gap-1.5 bg-mint/12 dark:bg-mint/10 text-sage dark:text-mint px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                            Active
                          </div>

                          <div className="mb-5">
                            <div className="font-bold text-sm text-primary dark:text-[#e8f0e0] mb-1">
                              {matchingChapter.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#9ca3af] dark:text-[#6b7d65] font-semibold uppercase tracking-wider mb-3">
                              <FaLocationDot className="text-mint" />
                              {matchingChapter.location}
                            </div>
                            <p className="text-xs text-[#6b7280] dark:text-[#8fa887] leading-relaxed">
                              {matchingChapter.desc}
                            </p>
                          </div>

                          <a
                            href="mailto:brightsidefinance@gmail.com"
                            className="inline-flex items-center gap-2 bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm"
                          >
                            Connect <FaArrowRight className="text-[10px]" />
                          </a>
                        </>
                      ) : (
                        <>
                          <div className="inline-flex items-center gap-1.5 bg-primary/5 dark:bg-[#343e34] text-[#9ca3af] dark:text-[#6b7d65] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-5">
                            Coming Soon
                          </div>

                          <p className="text-xs text-[#6b7280] dark:text-[#8fa887] leading-relaxed mb-6">
                            There&apos;s no Brightside chapter in {selectedState.name} yet. Be the first — start one and bring financial literacy to your community.
                          </p>

                          <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSe_3yaltwL4w-Gu_6H5LtnL9EASQ1pzO48w6ZcTtn8820-UgA/viewform?usp=header"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm w-full justify-center"
                          >
                            Start a Chapter in {selectedState.name} <FaArrowRight className="text-[10px]" />
                          </a>
                        </>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Chapter Cards Section */}
      <section className="py-24 px-6 md:px-16 bg-cream dark:bg-[#111511] transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="// Active Chapters"
              title="4 chapters and counting"
              subtitle="Each chapter is led by passionate local volunteers dedicated to improving financial literacy in their community."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {activeChaptersList.map((chapter, idx) => (
              <RevealOnScroll key={chapter.name} delay={idx * 0.05}>
                <div className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-[20px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group h-full flex flex-col justify-between">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage to-mint" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0] mb-1 group-hover:text-primary-light dark:group-hover:text-mint transition-colors">
                      {chapter.name}
                    </h3>
                    <span className="text-[10px] font-bold text-sage dark:text-mint tracking-wider uppercase block mb-4">
                      {chapter.location}
                    </span>
                    <p className="text-xs text-[#6b7280] dark:text-[#8fa887] leading-relaxed mb-6">
                      {chapter.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-sage dark:text-mint font-bold uppercase tracking-wider pt-4 border-t border-primary/5 dark:border-mint/5 mt-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                    Active Chapter
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Start A Chapter CTA */}
      <section className="py-24 px-6 md:px-16 bg-secondary-light dark:bg-[#1a1f1a] transition-colors duration-200">
        <div className="max-w-[600px] mx-auto text-center">
          <RevealOnScroll>
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 dark:bg-mint/10 dark:border-mint/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary dark:text-[#e8f0e0] mb-6">
                {'// Get Involved'}
              </span>
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-primary dark:text-[#e8f0e0] mb-5">
                Start a chapter in your state
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-[#4a5647] dark:text-[#8fa887] mb-8 max-w-[500px]">
                Passionate about financial literacy? Start a Brightside chapter in your community and help us reach every corner of the country.
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSe_3yaltwL4w-Gu_6H5LtnL9EASQ1pzO48w6ZcTtn8820-UgA/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light dark:bg-primary-light dark:hover:bg-sage text-cream font-bold px-8 py-4 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Start a Chapter <FaArrowRight />
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
