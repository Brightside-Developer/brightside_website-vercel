'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <div className="relative pt-36 pb-20 px-6 md:px-16 overflow-hidden bg-secondary-light dark:bg-[#111511] transition-colors duration-200">
      {/* Background radial overlays */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_80%_at_90%_50%,rgba(43,66,36,0.1)_0%,transparent_65%),radial-gradient(ellipse_40%_50%_at_5%_80%,rgba(201,204,180,0.25)_0%,transparent_55%)] dark:bg-[radial-gradient(ellipse_60%_80%_at_90%_50%,rgba(142,186,126,0.06)_0%,transparent_65%),radial-gradient(ellipse_40%_50%_at_5%_80%,rgba(142,186,126,0.03)_0%,transparent_55%)]"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(43,66,36,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(43,66,36,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(142,186,126,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(142,186,126,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative z-10 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-[700px]"
        >
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 dark:bg-mint/10 dark:border-mint/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary dark:text-[#e8f0e0] mb-6">
            {eyebrow}
          </span>
          
          {/* Title */}
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-black leading-[1.05] text-primary dark:text-[#e8f0e0] mb-5">
            {title}
          </h1>
          
          {/* Description */}
          <div className="text-base md:text-lg leading-relaxed text-[#4a5647] dark:text-[#8fa887] max-w-[580px]">
            {description}
          </div>
        </motion.div>
        
        {children && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
