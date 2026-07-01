'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authClient } from '@/lib/auth/authClient';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial session
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await authClient.auth.getSession();
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch {
        // Session fetch failed — user remains null
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const { data, error } = await authClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Map Supabase errors to friendly messages
          if (error.message.includes('Invalid login credentials')) {
            return { ok: false, error: 'Invalid email or password.' };
          }
          if (error.message.includes('Email not confirmed')) {
            return { ok: false, error: 'Please confirm your email address before signing in.' };
          }
          return { ok: false, error: 'Unable to sign in. Please try again.' };
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }

        return { ok: true };
      } catch {
        return { ok: false, error: 'Unable to connect. Please check your internet connection.' };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authClient.auth.signOut();
    } catch {
      // Logout failed silently — clear local state anyway
    }
    setUser(null);
    setSession(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await authClient.auth.refreshSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch {
      // Refresh failed — user remains as-is
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
