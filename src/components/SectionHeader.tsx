'use client';

import React from 'react';

interface SectionHeaderProps {
  label: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center max-w-[700px] mx-auto' : 'max-w-[600px]'}`}>
      <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary-light dark:text-[#6b9960] block mb-3">
        {'// '}{label}
      </span>
      <h2 className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-black text-primary dark:text-[#e8f0e0] leading-[1.15] mb-4">
        {title}
      </h2>
      {subtitle && (
        <div className={`text-base leading-relaxed text-[#576455] dark:text-[#8fa887] ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
