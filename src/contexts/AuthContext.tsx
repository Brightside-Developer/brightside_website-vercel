'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  photo_url?: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  supabase: typeof supabase | null;
  authLoading: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  supabase: null,
  authLoading: true,
  isAdmin: false,
  isBanned: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isBanned, setIsBanned] = useState<boolean>(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('photo_url, full_name')
        .eq('id', userId)
        .single();
      if (!error && data) setProfile(data);
      else setProfile(null);
    } catch (e) {
      console.error('Error fetching profile:', e);
      setProfile(null);
    }
  };

  const checkAdminAndBan = async (userId: string) => {
    const [{ data: adminRow }, { data: banRow }] = await Promise.all([
      supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle(),
      supabase.from('banned_users').select('user_id').eq('user_id', userId).maybeSingle(),
    ]);
    setIsAdmin(!!adminRow);
    setIsBanned(!!banRow);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id),
          checkAdminAndBan(session.user.id),
        ]);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await Promise.all([
          fetchProfile(currentSession.user.id),
          checkAdminAndBan(currentSession.user.id),
        ]);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsBanned(false);
      }
      setAuthLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, supabase, authLoading, isAdmin, isBanned, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
