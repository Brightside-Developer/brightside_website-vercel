'use client';

import React from 'react';
import Link from 'next/link';
import { FaXTwitter, FaLinkedin, FaFacebook, FaYoutube } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-primary-dark dark:bg-[#111511] text-secondary/75 border-t border-secondary/10 py-16 px-6 md:px-16 mt-auto transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Brightside" className="w-[38px] h-[38px] object-contain mix-blend-screen" />
            <span className="font-serif text-xl font-black tracking-tight text-secondary">
              Bright<span className="text-[#c8dabb] dark:text-[#c8dfc0]">side</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed max-w-[280px] text-secondary/45 dark:text-[#6b7d65]">
            Financial literacy for every age, every background, every chapter of life. Free, always.
          </p>
        </div>

        {/* Column 1 */}
        <div>
          <h4 className="font-mono text-[11px] tracking-widest uppercase text-secondary/35 dark:text-[#8fa887] mb-4">
            Pages
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            <li><Link href="/about" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">About Us</Link></li>
            <li><Link href="/courses" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Courses</Link></li>
            <li><Link href="/medical" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Medical Finances</Link></li>
            <li><Link href="/chapters" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Chapters</Link></li>
            <li><Link href="/partnerships" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Partnerships</Link></li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="font-mono text-[11px] tracking-widest uppercase text-secondary/35 dark:text-[#8fa887] mb-4">
            Programs
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            <li><Link href="/courses" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Money Sprouts</Link></li>
            <li><Link href="/courses" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Smart Start</Link></li>
            <li><Link href="/courses" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Financial Foundations</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="font-mono text-[11px] tracking-widest uppercase text-secondary/35 dark:text-[#8fa887] mb-4">
            Organization
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            <li><Link href="/about" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Our Story</Link></li>
            <li><Link href="/about#team" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Our Team</Link></li>
            <li><Link href="#" className="text-sm text-secondary/55 dark:text-[#8fa887] hover:text-secondary dark:hover:text-[#c8dfc0] transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-[1100px] mx-auto border-t border-secondary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary/30 dark:text-[#8fa887] transition-colors duration-200">
        <span>© 2026 Brightside Finance Foundation</span>
        <div className="flex gap-3">
          <Link href="#" aria-label="𝕏 (formerly Twitter)" className="w-9 h-9 border border-secondary/15 rounded-lg flex items-center justify-center text-secondary/50 hover:border-secondary hover:text-secondary transition-all">
            <FaXTwitter className="text-sm" />
          </Link>
          <Link href="#" aria-label="LinkedIn" className="w-9 h-9 border border-secondary/15 rounded-lg flex items-center justify-center text-secondary/50 hover:border-secondary hover:text-secondary transition-all">
            <FaLinkedin className="text-sm" />
          </Link>
          <Link href="#" aria-label="Facebook" className="w-9 h-9 border border-secondary/15 rounded-lg flex items-center justify-center text-secondary/50 hover:border-secondary hover:text-secondary transition-all">
            <FaFacebook className="text-sm" />
          </Link>
          <Link href="#" aria-label="YouTube" className="w-9 h-9 border border-secondary/15 rounded-lg flex items-center justify-center text-secondary/50 hover:border-secondary hover:text-secondary transition-all">
            <FaYoutube className="text-sm" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
