'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronDown, FaTimes, FaUser, FaCog, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut, authLoading, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Medical', path: '/medical' },
    { name: 'Chapters', path: '/chapters' },
    { name: 'Partnerships', path: '/partnerships' },
    { name: 'Simulator', path: '/simulator' },
  ];

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    window.location.href = '/';
  };

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  const getDisplayName = (): string => {
    const full =
      profile?.full_name?.trim() ||
      (user?.user_metadata?.full_name as string | undefined)?.trim() ||
      (user?.user_metadata?.name as string | undefined)?.trim() ||
      '';
    return full || user?.email || 'Account';
  };

  const getUserName = () => getDisplayName().split(' ')[0];

  return (
    <>
      {/* ── PILL NAVBAR ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ left: '50%', x: '-50%' }}
        className={`fixed top-[18px] z-[200] w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] max-w-[1160px] flex items-center justify-between py-2 px-3 rounded-full transition-all duration-300 ${
          scrolled
            ? 'glass-nav-scrolled bg-primary-dark/97 border-primary-light/20 shadow-xl'
            : 'glass-nav bg-primary/90 border-secondary/18 shadow-lg'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 pl-1">
          <img src="/logo.png" alt="Brightside" className="w-[34px] h-[34px] object-contain mix-blend-screen shrink-0" />
          <span className="font-serif text-[1.1rem] font-black tracking-tight leading-none">
            <span className="text-secondary">Bright</span>
            <span className="text-mint">side</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex items-center gap-0.5 list-none mx-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  href={link.path}
                  className={`text-[11px] xl:text-[11.5px] font-semibold tracking-wide py-1.5 px-3 rounded-full transition-all duration-200 block whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-white/13'
                      : 'text-secondary/72 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-2 pr-1 shrink-0">
          {/* Donate */}
          <Link
            href="https://hcb.hackclub.com/donations/start/brightside-finance-foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-bold text-[11px] xl:text-[11.5px] py-1.5 px-4 rounded-full border border-mint/30 bg-mint/15 text-mint hover:bg-mint/25 hover:border-mint/50 transition-all duration-200"
          >
            Donate
          </Link>

          {/* Auth */}
          {!authLoading && (
            <div className="relative">
              {user ? (
                <>
                  <button
                    ref={buttonRef}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-full border transition-all duration-200 cursor-pointer ${
                      dropdownOpen
                        ? 'bg-white/15 border-white/25 text-white'
                        : 'bg-white/8 border-white/14 text-secondary/80 hover:bg-white/13 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="w-[22px] h-[22px] rounded-full bg-mint/25 border border-mint/40 flex items-center justify-center text-[9px] font-bold text-mint overflow-hidden shrink-0">
                      {profile?.photo_url ? (
                        <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : getInitials()}
                    </div>
                    <span className="text-[11px] font-semibold max-w-[80px] truncate">{getUserName()}</span>
                    <FaChevronDown className={`text-[7px] opacity-55 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full right-0 mt-2.5 z-[201] bg-white dark:bg-[#1e2819] border border-primary/10 dark:border-mint/15 rounded-[18px] shadow-[0_20px_60px_rgba(43,66,36,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] min-w-[200px] overflow-hidden"
                      >
                        {/* Header */}
                        <div className="px-4 py-3.5 border-b border-primary/6 dark:border-mint/8">
                          <div className="text-xs font-semibold text-primary dark:text-[#e8f0e0] truncate">
                            {getDisplayName()}
                          </div>
                          <div className="text-[10px] text-[#9ca3af] dark:text-mint/40 truncate mt-0.5">{user.email}</div>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 py-2.5 px-4 text-xs font-medium text-primary dark:text-[#e8f0e0] hover:bg-primary/5 dark:hover:bg-mint/8 transition-colors"
                        >
                          <FaUser className="text-[9px] text-sage dark:text-mint shrink-0" />
                          Account Details
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 py-2.5 px-4 text-xs font-medium text-primary dark:text-[#e8f0e0] hover:bg-primary/5 dark:hover:bg-mint/8 transition-colors"
                        >
                          <FaCog className="text-[9px] text-sage dark:text-mint shrink-0" />
                          Settings
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 py-2.5 px-4 text-xs font-medium text-primary dark:text-[#e8f0e0] hover:bg-primary/5 dark:hover:bg-mint/8 border-b border-primary/6 dark:border-mint/8 transition-colors"
                          >
                            <FaShieldAlt className="text-[9px] text-sage dark:text-mint shrink-0" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 py-2.5 px-4 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer bg-transparent border-none text-left"
                        >
                          <FaSignOutAlt className="text-[9px] shrink-0" />
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex items-center font-bold text-[11px] xl:text-[11.5px] py-1.5 px-4 rounded-full bg-primary-light hover:bg-sage text-cream transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Log In
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex flex-col gap-[5px] cursor-pointer p-2 bg-transparent border-none group mr-1"
          aria-label="Open menu"
        >
          <span className="block w-[18px] h-[1.5px] bg-secondary rounded transition-transform group-hover:scale-x-110" />
          <span className="block w-[18px] h-[1.5px] bg-secondary rounded" />
          <span className="block w-[18px] h-[1.5px] bg-secondary rounded transition-transform group-hover:scale-x-90" />
        </button>
      </motion.nav>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-primary/98 dark:bg-[#0d1209]/98 z-[300] flex flex-col items-center justify-center gap-5"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-secondary/60 hover:text-secondary text-xl cursor-pointer p-2 transition-colors bg-transparent border-none"
              aria-label="Close menu"
            >
              <FaTimes />
            </button>

            {navLinks.map((link, idx) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 + idx * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-serif text-[1.6rem] font-bold tracking-tight transition-colors duration-200 ${
                    pathname === link.path
                      ? 'text-white underline decoration-mint decoration-2 underline-offset-8'
                      : 'text-secondary/65 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 + navLinks.length * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 items-center w-full max-w-[260px] mt-5 pt-6 border-t border-white/10"
            >
              <Link
                href="https://hcb.hackclub.com/donations/start/brightside-finance-foundation"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center font-bold py-3.5 px-8 rounded-full text-primary bg-mint hover:bg-mint/90 transition-colors text-sm"
              >
                Donate
              </Link>

              {!authLoading && (
                user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center font-semibold py-3 px-8 rounded-full text-cream border border-cream/15 hover:bg-white/8 transition-colors text-sm"
                    >
                      {getUserName()}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="w-full text-center font-semibold py-3 px-8 rounded-full text-mint border border-mint/20 hover:bg-mint/10 transition-colors text-sm"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      className="w-full text-center font-semibold py-3 px-8 rounded-full text-red-400 border border-red-400/20 hover:bg-red-400/8 transition-colors text-sm cursor-pointer bg-transparent border-solid"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center font-bold py-3.5 px-8 rounded-full text-cream bg-primary-light hover:bg-sage transition-colors text-sm"
                  >
                    Log In
                  </Link>
                )
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
