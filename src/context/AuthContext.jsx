import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const DEMO_USER_KEY = 'frameverse_admin_user';

const ENV_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'yv836254@gmail.com').trim().toLowerCase();
const ENV_ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'yashu@2369').trim();

// Verified primary admin constants to guarantee login access
const PRIMARY_ADMIN_EMAIL = 'yv836254@gmail.com';
const PRIMARY_ADMIN_PASSWORD = 'yashu@2369';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function checkAdminSession() {
      try {
        const saved = localStorage.getItem(DEMO_USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setSession({ user: parsed });
          return true;
        }
      } catch (err) {
        console.warn('Failed reading admin session from storage', err);
      }
      return false;
    }

    const hasLocalAdmin = checkAdminSession();
    let subscription = null;

    if (isSupabaseConfigured() && supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        } else if (!hasLocalAdmin) {
          // Only clear session if no verified local admin is present
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      }).catch((err) => {
        console.warn('Error fetching Supabase session:', err);
        setLoading(false);
      });

      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(DEMO_USER_KEY);
          setUser(null);
          setSession(null);
        }
      });
      subscription = data.subscription;
    } else {
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    // Direct check for Director Yashu Super Admin credentials
    const isPrimaryAdmin =
      (cleanEmail === 'yv836254@gmail.com' && cleanPassword === 'yashu@2369') ||
      (cleanEmail === PRIMARY_ADMIN_EMAIL && cleanPassword === PRIMARY_ADMIN_PASSWORD) ||
      (ENV_ADMIN_EMAIL && cleanEmail === ENV_ADMIN_EMAIL && cleanPassword === ENV_ADMIN_PASSWORD);

    if (isPrimaryAdmin) {
      const adminUser = {
        id: 'super-admin-user',
        email: cleanEmail,
        role: 'authenticated',
        user_metadata: { name: 'Director Yashu (Super Admin)' },
      };
      try {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(adminUser));
      } catch (e) {
        console.warn('Error saving local admin session:', e);
      }
      setUser(adminUser);
      setSession({ user: adminUser });

      // If Supabase is active, sync session in background without blocking or throwing
      if (isSupabaseConfigured() && supabase) {
        supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        }).then(({ data, error }) => {
          if (!error && data?.session && data?.user) {
            setUser(data.user);
            setSession(data.session);
          }
        }).catch(() => {});
      }

      return { user: adminUser, session: { user: adminUser } };
    }

    // 2. Fallback to Supabase Cloud Auth for any other users
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data?.user) {
        setUser(data.user);
        setSession(data.session);
        return data;
      }

      if (error) {
        throw new Error(error.message);
      }
    }

    throw new Error('Invalid email or password. Please verify your credentials.');
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
    setSession(null);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out of Supabase:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
