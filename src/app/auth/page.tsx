'use client';
// src/app/auth/page.tsx
import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AuthPage() {
  const { user, authLoading } = useContext(AuthContext);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitInFlight, setSubmitInFlight] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4500);
  };

  const friendlyError = (err: unknown): string => {
    const msg = (err as { message?: string })?.message || '';
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
    if (msg.includes('User already registered')) return 'An account with this email already exists.';
    if (msg.includes('Password should be at least 6 characters')) return 'Password must be at least 6 characters.';
    return msg || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async () => {
    if (submitInFlight) return;
    if (!supabase) { showError('Supabase connection not configured.'); return; }
    if (!email || !password) { showError('Please fill in all fields.'); return; }
    if (email.length > 100 || !/^\S+@\S+\.\S+$/.test(email)) { showError('Please enter a valid email.'); return; }
    if (password.length > 128) { showError('Password too long.'); return; }
    if (mode === 'signup') {
      if (!fullName || !dob) { showError('Please fill in all fields.'); return; }
      if (fullName.length > 60 || !/^[a-zA-Z\s\-']+$/.test(fullName)) { showError('Please enter a valid name.'); return; }
    }
    setSubmitInFlight(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, dob } },
        });
        if (error) throw error;
        if (data?.user) {
          const { error: profileErr } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, full_name: fullName, dob, email }]);
          if (profileErr) console.warn('Profile insert error:', profileErr);
        }
      }
    } catch (e) {
      showError(friendlyError(e));
    } finally {
      setSubmitInFlight(false);
    }
  };

  const handleGoogle = async () => {
    if (submitInFlight) return;
    if (!supabase) { showError('Supabase connection not configured.'); return; }
    setSubmitInFlight(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (e) {
      showError(friendlyError(e));
    } finally {
      setSubmitInFlight(false);
    }
  };

  useEffect(() => {
    if (user) window.location.href = '/';
  }, [user]);

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-primary/15 dark:border-mint/15 bg-white dark:bg-[#242924] text-primary dark:text-[#e8f0e0] placeholder-[#9ca3af] dark:placeholder-[#6b7d65] text-sm focus:outline-none focus:border-primary/50 dark:focus:border-mint/50 focus:ring-2 focus:ring-primary/8 dark:focus:ring-mint/8 transition-all';
  const labelClass = 'block font-semibold text-xs text-primary dark:text-[#e8f0e0] mb-1.5 tracking-wide';

  return (
    <div className="flex flex-col md:flex-row flex-1">

      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden md:flex flex-col justify-end p-12 bg-primary dark:bg-[#111511] text-cream relative overflow-hidden md:w-[42%] shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_20%,rgba(142,186,126,0.15)_0%,transparent_60%)] pointer-events-none" />


        <div className="relative z-10 max-w-sm">
          <div className="h-[3px] w-10 bg-mint/50 rounded-full mb-7" />
          <h2 className="font-serif text-[clamp(1.7rem,2.5vw,2.5rem)] font-black mb-4 leading-snug">
            Pick up right where you <em className="not-italic text-mint">left off</em>
          </h2>
          <p className="text-cream/60 text-sm leading-relaxed mb-8">
            Your progress, portfolio, and curriculum are saved to your account — sign in to keep building your financial future.
          </p>
          <ul className="space-y-3">
            {[
              'Track your curriculum progress',
              'Practice with our market simulator',
              'Earn certificates as you complete courses',
              '100% free — always',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-cream/70">
                <span className="w-1.5 h-1.5 rounded-full bg-mint/70 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex flex-col justify-center flex-1 px-6 py-16 md:px-12 lg:px-16 bg-warm-white dark:bg-[#1a1f1a]">
        <div className="max-w-[400px] w-full mx-auto">

          {/* Tab switcher */}
          <div className="flex border-b-2 border-primary/10 dark:border-mint/10 mb-8">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 pb-3 text-sm font-bold transition-all border-b-2 -mb-[2px] cursor-pointer bg-transparent ${
                  mode === m
                    ? 'border-primary dark:border-mint text-primary dark:text-mint'
                    : 'border-transparent text-[#9ca3af] hover:text-primary dark:hover:text-mint'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <h1 className="font-serif text-2xl font-black text-primary dark:text-[#e8f0e0] mb-1.5">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-[#6b7280] dark:text-[#8fa887] mb-7">
            {mode === 'login' ? 'Sign in to continue your financial journey' : 'Join thousands building their financial future'}
          </p>

          {/* Google */}
          <button
            className="w-full flex items-center justify-center gap-2.5 py-3 mb-5 bg-white dark:bg-[#242924] border border-primary/15 dark:border-mint/15 rounded-full hover:border-primary/30 dark:hover:border-mint/30 hover:bg-cream dark:hover:bg-[#2a302a] disabled:opacity-50 transition-all text-sm font-semibold text-primary dark:text-[#e8f0e0] shadow-sm cursor-pointer"
            disabled={submitInFlight}
            onClick={handleGoogle}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-grow h-px bg-primary/8 dark:bg-mint/8" />
            <span className="text-xs text-[#9ca3af] dark:text-[#6b7d65] font-medium">or</span>
            <div className="flex-grow h-px bg-primary/8 dark:bg-mint/8" />
          </div>

          {/* Signup-only fields */}
          {mode === 'signup' && (
            <>
              <div className="mb-4">
                <label className={labelClass} htmlFor="full-name">Full name</label>
                <input id="full-name" type="text" placeholder="Jane Smith" className={inputClass} value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className={labelClass} htmlFor="dob">Date of birth</label>
                <input id="dob" type="date" className={inputClass} value={dob} onChange={e => setDob(e.target.value)} />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className={labelClass} htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-5">
            <label className={labelClass} htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl">
              {errorMsg}
            </div>
          )}

          <button
            className="w-full bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream font-bold py-3.5 rounded-full text-sm disabled:opacity-50 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer"
            disabled={submitInFlight}
            onClick={handleSubmit}
          >
            {submitInFlight ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p className="text-xs text-[#9ca3af] dark:text-[#6b7d65] mt-5 leading-relaxed">
            By continuing you agree to our{' '}
            <Link href="#" className="underline hover:text-primary dark:hover:text-mint transition-colors">Terms of Service</Link>{' '}
            and{' '}
            <Link href="#" className="underline hover:text-primary dark:hover:text-mint transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
