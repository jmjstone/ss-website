'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  userProfile: { first_name: string; last_name: string; is_admin: boolean } | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AuthContextType['userProfile']>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    setUserProfile(profile);
    setIsAdmin(profile?.is_admin || false);
    return profile;
  };

  useEffect(() => {
    const initializeUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) await fetchProfile(currentUser.id);
      setLoading(false);
    };

    initializeUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        await fetchProfile(newUser.id);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;

      const loggedInUser = data.user ?? data.session?.user ?? null;
      setUser(loggedInUser);

      if (loggedInUser) await fetchProfile(loggedInUser.id);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Unknown error';
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isAdmin, loading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
