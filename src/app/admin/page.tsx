'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaSpinner, FaPlus, FaBan, FaRotateLeft } from 'react-icons/fa6';

interface Competition {
  id: string;
  name: string;
  admin_user_id: string;
  starting_cash: number;
  start_date: string;
  end_date: string;
  status: string;
  visibility: string;
  join_code: string | null;
  created_at: string;
}

interface UserEntry {
  uid: string;
  display_name: string;
  photo_url: string | null;
  total_value: number;
  return_pct: number;
  updated_at: string;
  is_banned: boolean;
}

const EMPTY_FORM = {
  name: '',
  start_date: '',
  end_date: '',
  starting_cash: 100000,
  visibility: 'public',
  join_code: '',
  status: 'upcoming',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const statusCls = (s: string) => ({
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ended:    'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400',
}[s] ?? 'bg-gray-100 text-gray-500');

export default function AdminPage() {
  const { user, isAdmin, authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'competitions' | 'users'>('competitions');

  // ── Competitions ──────────────────────────────────────────────
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [compLoading, setCompLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // ── Users ─────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [inflight, setInflight] = useState<string | null>(null);

  // Redirect non-admins once auth resolves
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.replace('/');
  }, [authLoading, user, isAdmin, router]);

  const loadCompetitions = useCallback(async () => {
    setCompLoading(true);
    const { data } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCompetitions(data as Competition[]);
    setCompLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    const [{ data: lb }, { data: banned }] = await Promise.all([
      supabase.rpc('get_main_leaderboard'),
      supabase.from('banned_users').select('user_id'),
    ]);
    const bannedSet = new Set((banned ?? []).map((b: { user_id: string }) => b.user_id));
    setUsers(
      (lb ?? []).map((e: Omit<UserEntry, 'is_banned'>) => ({ ...e, is_banned: bannedSet.has(e.uid) }))
    );
    setUsersLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAdmin) loadCompetitions();
  }, [isAdmin, loadCompetitions]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === 'users' && isAdmin) loadUsers();
  }, [tab, isAdmin, loadUsers]);

  // ── Competition actions ───────────────────────────────────────
  const handleCreate = async () => {
    setFormError('');
    if (!form.name.trim() || !form.start_date || !form.end_date) {
      setFormError('Name, start date, and end date are required.');
      return;
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setFormError('End date must be after start date.');
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('competitions').insert({
      name:          form.name.trim(),
      admin_user_id: user!.id,
      starting_cash: form.starting_cash,
      start_date:    form.start_date,
      end_date:      form.end_date,
      visibility:    form.visibility,
      join_code:     form.join_code.trim() || null,
      status:        form.status,
    });
    setCreating(false);
    if (error) { setFormError(error.message); return; }
    setFormSuccess('Competition created successfully.');
    setForm(EMPTY_FORM);
    setShowForm(false);
    loadCompetitions();
    setTimeout(() => setFormSuccess(''), 4000);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('competitions').update({ status }).eq('id', id);
    setCompetitions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  // ── User actions ──────────────────────────────────────────────
  const resetPortfolio = async (uid: string, name: string) => {
    if (!confirm(`Reset ${name}'s portfolio to $100,000? This cannot be undone.`)) return;
    setInflight(uid + ':reset');
    await supabase
      .from('game_state')
      .update({ cash: 100000, holdings: {}, total_value: 100000 })
      .eq('uid', uid);
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, total_value: 100000, return_pct: 0 } : u));
    setInflight(null);
  };

  const banUser = async (uid: string, name: string) => {
    if (!confirm(`Ban ${name}? They will see a blocked message in the simulator.`)) return;
    setInflight(uid + ':ban');
    await supabase.from('banned_users').insert({ user_id: uid });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, is_banned: true } : u));
    setInflight(null);
  };

  const unbanUser = async (uid: string) => {
    setInflight(uid + ':unban');
    await supabase.from('banned_users').delete().eq('user_id', uid);
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, is_banned: false } : u));
    setInflight(null);
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center bg-warm-white dark:bg-[#1a1f1a]">
        <FaSpinner className="animate-spin text-2xl text-primary-light dark:text-mint" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-warm-white dark:bg-[#1a1f1a]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-28">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-1.5">Brightside</span>
            <h1 className="font-serif text-3xl font-black text-primary dark:text-[#e8f0e0]">Admin Dashboard</h1>
          </div>
          <span className="font-mono text-[10px] px-3 py-1.5 rounded-full bg-primary/10 dark:bg-mint/15 text-primary-light dark:text-mint tracking-wider self-start sm:self-auto">
            {user?.email}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-full p-1 shadow-sm mb-8 w-fit">
          {(['competitions', 'users'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                tab === t
                  ? 'bg-primary dark:bg-primary-light text-cream shadow-sm'
                  : 'text-[#9ca3af] dark:text-[#6b7d65] hover:text-primary dark:hover:text-mint'
              }`}
            >
              {t === 'competitions' ? 'Competitions' : 'User Management'}
            </button>
          ))}
        </div>

        {/* ── COMPETITIONS ── */}
        {tab === 'competitions' && (
          <div className="flex flex-col gap-5">

            {formSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-5 py-3 rounded-xl">
                {formSuccess}
              </div>
            )}

            {/* Create form card */}
            <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm overflow-hidden">
              <button
                onClick={() => { setShowForm(v => !v); setFormError(''); }}
                className="w-full flex items-center justify-between px-6 md:px-8 py-5 cursor-pointer"
              >
                <span className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0]">New Competition</span>
                <span className={`w-7 h-7 rounded-full bg-primary dark:bg-primary-light flex items-center justify-center text-cream text-xs transition-transform duration-200 ${showForm ? 'rotate-45' : ''}`}>
                  <FaPlus />
                </span>
              </button>

              {showForm && (
                <div className="border-t border-primary/6 dark:border-mint/8 px-6 md:px-8 py-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

                    <div className="sm:col-span-2">
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] block mb-1.5">Competition Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Summer 2026 Trading Challenge"
                        className="w-full py-2.5 px-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] block mb-1.5">Start Date *</label>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                        className="w-full py-2.5 px-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] block mb-1.5">End Date *</label>
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                        className="w-full py-2.5 px-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] block mb-1.5">Starting Cash ($)</label>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={form.starting_cash}
                        onChange={e => setForm(f => ({ ...f, starting_cash: Number(e.target.value) }))}
                        className="w-full py-2.5 px-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] block mb-1.5">Initial Status</label>
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full py-2.5 px-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] block mb-1.5">Visibility</label>
                      <select
                        value={form.visibility}
                        onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                        className="w-full py-2.5 px-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7d65] block mb-1.5">Join Code <span className="normal-case opacity-60">(optional — leave blank for open enrollment)</span></label>
                      <input
                        type="text"
                        value={form.join_code}
                        onChange={e => setForm(f => ({ ...f, join_code: e.target.value }))}
                        placeholder="e.g. SUMMER26"
                        className="w-full py-2.5 px-4 rounded-xl border border-primary/12 dark:border-mint/12 focus:border-primary/40 dark:focus:border-mint/40 focus:outline-none bg-warm-white dark:bg-[#1a1f1a] text-primary dark:text-[#e8f0e0] text-sm transition-all"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-xs text-rose-600 font-semibold mb-4 bg-rose-50 dark:bg-rose-950/20 px-4 py-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      {formError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowForm(false); setFormError(''); setForm(EMPTY_FORM); }}
                      className="px-5 py-2.5 rounded-xl border border-primary/12 dark:border-mint/12 text-sm font-semibold text-[#6b7280] dark:text-[#8fa887] hover:bg-primary/4 dark:hover:bg-mint/6 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={creating}
                      className="px-7 py-2.5 rounded-xl bg-primary dark:bg-primary-light hover:bg-primary-light dark:hover:bg-sage text-cream text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                    >
                      {creating && <FaSpinner className="animate-spin text-xs" />}
                      {creating ? 'Creating…' : 'Create Competition'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Competitions list */}
            <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-primary/6 dark:border-mint/8 flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0]">All Competitions</h3>
                <button onClick={loadCompetitions} className="text-xs font-semibold text-primary-light dark:text-mint hover:text-primary transition-colors cursor-pointer">
                  Refresh
                </button>
              </div>

              {compLoading ? (
                <div className="flex items-center justify-center py-16">
                  <FaSpinner className="animate-spin text-xl text-primary-light dark:text-mint" />
                </div>
              ) : competitions.length === 0 ? (
                <p className="px-8 py-12 text-center text-sm text-[#9ca3af] dark:text-[#6b7d65]">
                  No competitions yet. Create one above.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-primary/6 dark:border-mint/8">
                        <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-6 md:px-8 py-3.5">Name</th>
                        <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-4 py-3.5 hidden sm:table-cell">Dates</th>
                        <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-4 py-3.5 hidden md:table-cell">Cash</th>
                        <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-4 py-3.5">Status</th>
                        <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-4 py-3.5 hidden lg:table-cell">Join Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitions.map(comp => (
                        <tr key={comp.id} className="border-b border-primary/4 dark:border-mint/5 last:border-0 hover:bg-primary/2 dark:hover:bg-mint/3 transition-colors">
                          <td className="px-6 md:px-8 py-4">
                            <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{comp.name}</div>
                            <div className="font-mono text-[9px] text-[#9ca3af] dark:text-[#6b7d65] mt-0.5 capitalize">{comp.visibility}</div>
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <div className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65]">
                              {new Date(comp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65]">
                              → {new Date(comp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <span className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{fmt(comp.starting_cash)}</span>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={comp.status}
                              onChange={e => updateStatus(comp.id, e.target.value)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border-0 cursor-pointer focus:outline-none ${statusCls(comp.status)}`}
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="active">Active</option>
                              <option value="ended">Ended</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <span className="font-mono text-xs text-[#9ca3af] dark:text-[#6b7d65]">
                              {comp.join_code ?? '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="bg-white dark:bg-[#242924] border border-primary/8 dark:border-mint/10 rounded-[20px] shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 py-5 border-b border-primary/6 dark:border-mint/8 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0]">Active Players</h3>
                <p className="text-[10px] text-[#9ca3af] dark:text-[#6b7d65] mt-0.5">Users who have opened the simulator at least once.</p>
              </div>
              <button onClick={loadUsers} className="text-xs font-semibold text-primary-light dark:text-mint hover:text-primary transition-colors cursor-pointer shrink-0">
                Refresh
              </button>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <FaSpinner className="animate-spin text-xl text-primary-light dark:text-mint" />
              </div>
            ) : users.length === 0 ? (
              <p className="px-8 py-12 text-center text-sm text-[#9ca3af] dark:text-[#6b7d65]">No active players yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-primary/6 dark:border-mint/8">
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-left px-6 md:px-8 py-3.5">Player</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5">Portfolio</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-4 py-3.5 hidden sm:table-cell">Return</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-center px-4 py-3.5">Status</th>
                      <th className="font-mono text-[10px] text-[#9ca3af] dark:text-[#6b7d65] uppercase tracking-wider text-right px-6 md:px-8 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const busy = inflight?.startsWith(u.uid);
                      return (
                        <tr
                          key={u.uid}
                          className={`border-b border-primary/4 dark:border-mint/5 last:border-0 transition-colors ${
                            u.is_banned ? 'bg-rose-50/40 dark:bg-rose-950/15' : 'hover:bg-primary/2 dark:hover:bg-mint/3'
                          }`}
                        >
                          <td className="px-6 md:px-8 py-4">
                            <div className="flex items-center gap-2.5">
                              {u.photo_url ? (
                                <img src={u.photo_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/15 dark:bg-mint/20 flex items-center justify-center text-[10px] font-bold text-primary dark:text-mint shrink-0">
                                  {u.display_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{u.display_name}</div>
                                <div className="font-mono text-[9px] text-[#9ca3af] dark:text-[#6b7d65]">{u.uid.slice(0, 14)}…</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-bold text-sm text-primary dark:text-[#e8f0e0]">{fmt(u.total_value)}</span>
                          </td>
                          <td className="px-4 py-4 text-right hidden sm:table-cell">
                            <span className={`font-bold text-sm ${u.return_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {u.return_pct >= 0 ? '+' : ''}{u.return_pct.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {u.is_banned ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Banned</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                            )}
                          </td>
                          <td className="px-6 md:px-8 py-4">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => resetPortfolio(u.uid, u.display_name)}
                                disabled={!!busy}
                                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {inflight === u.uid + ':reset' ? <FaSpinner className="animate-spin text-[9px]" /> : <FaRotateLeft className="text-[9px]" />}
                                Reset
                              </button>

                              {u.is_banned ? (
                                <button
                                  onClick={() => unbanUser(u.uid)}
                                  disabled={!!busy}
                                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {inflight === u.uid + ':unban' && <FaSpinner className="animate-spin text-[9px]" />}
                                  Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => banUser(u.uid, u.display_name)}
                                  disabled={!!busy}
                                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {inflight === u.uid + ':ban' ? <FaSpinner className="animate-spin text-[9px]" /> : <FaBan className="text-[9px]" />}
                                  Ban
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
