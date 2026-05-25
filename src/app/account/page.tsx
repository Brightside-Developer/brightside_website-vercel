'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

type Status = { type: 'success' | 'error'; msg: string } | null;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block font-mono text-[9px] tracking-[0.15em] uppercase text-[#9ca3af] dark:text-[#6b7d65] mb-1.5">
        {label}
      </span>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p className={`text-xs mt-3 font-medium ${status.type === 'success' ? 'text-mint dark:text-mint' : 'text-red-500'}`}>
      {status.msg}
    </p>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-primary/15 dark:border-mint/15 bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm focus:outline-none focus:border-primary/40 dark:focus:border-mint/40 transition-all';

export default function AccountPage() {
  const { user, profile, supabase, authLoading, refreshProfile } = useAuth();

  // Name
  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<Status>(null);
  const [nameBusy, setNameBusy] = useState(false);

  // DOB
  const [dob, setDob] = useState('');
  const [dobStatus, setDobStatus] = useState<Status>(null);
  const [dobBusy, setDobBusy] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<Status>(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) window.location.href = '/auth';
  }, [authLoading, user]);

  useEffect(() => {
    if (profile?.full_name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(profile.full_name);
    }
  }, [profile?.full_name]);

  // Fetch DOB from profiles (not on AuthContext profile type, so fetch separately)
  useEffect(() => {
    if (!user || !supabase) return;
    supabase
      .from('profiles')
      .select('dob')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data?.dob) setDob(data.dob); });
  }, [user, supabase]);

  const saveName = async () => {
    if (!supabase || !user) return;
    const trimmed = name.trim();
    if (!trimmed) { setNameStatus({ type: 'error', msg: 'Name cannot be empty.' }); return; }
    if (trimmed.length > 60) { setNameStatus({ type: 'error', msg: 'Name is too long.' }); return; }
    setNameBusy(true);
    const { error } = await supabase.from('profiles').update({ full_name: trimmed }).eq('id', user.id);
    setNameBusy(false);
    if (error) { setNameStatus({ type: 'error', msg: 'Failed to update name.' }); return; }
    await refreshProfile();
    setNameStatus({ type: 'success', msg: 'Name updated.' });
    setTimeout(() => setNameStatus(null), 3000);
  };

  const saveDob = async () => {
    if (!supabase || !user) return;
    if (!dob) { setDobStatus({ type: 'error', msg: 'Please enter a date.' }); return; }
    setDobBusy(true);
    const { error } = await supabase.from('profiles').update({ dob }).eq('id', user.id);
    setDobBusy(false);
    if (error) { setDobStatus({ type: 'error', msg: 'Failed to update date of birth.' }); return; }
    setDobStatus({ type: 'success', msg: 'Date of birth updated.' });
    setTimeout(() => setDobStatus(null), 3000);
  };

  const savePassword = async () => {
    if (!supabase) return;
    if (newPassword.length < 6) { setPwStatus({ type: 'error', msg: 'Password must be at least 6 characters.' }); return; }
    if (newPassword !== confirmPassword) { setPwStatus({ type: 'error', msg: 'Passwords do not match.' }); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwBusy(false);
    if (error) { setPwStatus({ type: 'error', msg: error.message || 'Failed to update password.' }); return; }
    setNewPassword('');
    setConfirmPassword('');
    setPwStatus({ type: 'success', msg: 'Password updated.' });
    setTimeout(() => setPwStatus(null), 3000);
  };

  if (authLoading) return (
    <div className="flex justify-center items-center flex-1 bg-warm-white dark:bg-[#1a1f1a]">
      <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary dark:border-mint/20 dark:border-t-mint animate-spin" />
    </div>
  );

  const btnClass = 'font-bold text-xs px-5 py-2 rounded-full bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream transition-all disabled:opacity-40 cursor-pointer';

  return (
    <div className="flex flex-col flex-1 bg-warm-white dark:bg-[#1a1f1a] px-6 py-20 md:px-16">
      <div className="max-w-[520px] mx-auto w-full">

        <div className="mb-8">
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-2">Account</span>
          <h1 className="font-serif text-3xl font-black text-primary dark:text-[#e8f0e0]">Account Details</h1>
        </div>

        {/* ── Info card ── */}
        <div className="bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-[20px] p-7 shadow-sm mb-4">
          <h3 className="font-semibold text-sm text-primary dark:text-[#e8f0e0] mb-4">Profile Info</h3>
          <div className="space-y-5">

            {/* Name */}
            <Field label="Full Name">
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className={inputClass}
                  placeholder="Your full name"
                />
                <button onClick={saveName} disabled={nameBusy} className={btnClass}>
                  {nameBusy ? '…' : 'Save'}
                </button>
              </div>
              <StatusBadge status={nameStatus} />
            </Field>

            {/* Date of birth */}
            <Field label="Date of Birth">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className={inputClass}
                />
                <button onClick={saveDob} disabled={dobBusy} className={btnClass}>
                  {dobBusy ? '…' : 'Save'}
                </button>
              </div>
              <StatusBadge status={dobStatus} />
            </Field>

            {/* Email (read-only) */}
            <Field label="Email">
              <p className="text-sm font-semibold text-primary dark:text-[#e8f0e0]">{user?.email}</p>
            </Field>

          </div>
        </div>

        {/* ── Password card ── */}
        <div className="bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-[20px] p-7 shadow-sm mb-6">
          <h3 className="font-semibold text-sm text-primary dark:text-[#e8f0e0] mb-0.5">Change Password</h3>
          <p className="text-xs text-[#6b7280] dark:text-[#8fa887] mb-5">Leave blank to keep your current password.</p>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              className={inputClass}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && savePassword()}
              placeholder="Confirm new password"
              className={inputClass}
            />
            <button onClick={savePassword} disabled={pwBusy} className={btnClass}>
              {pwBusy ? 'Updating…' : 'Update Password'}
            </button>
            <StatusBadge status={pwStatus} />
          </div>
        </div>

        <Link
          href="/settings"
          className="inline-flex items-center font-semibold text-sm text-primary-light dark:text-mint hover:text-primary dark:hover:text-cream transition-colors"
        >
          ← Back to Settings
        </Link>

      </div>
    </div>
  );
}
