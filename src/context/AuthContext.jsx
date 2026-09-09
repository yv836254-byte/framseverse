import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const DEMO_USER_KEY = 'frameverse_admin_user';

const ENV_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
const ENV_ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription = null;

    if (isSupabaseConfigured() && supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((err) => {
        console.warn('Error fetching Supabase session:', err);
        checkAdminSession();
      });

      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = data.subscription;
    } else {
      checkAdminSession();
    }

    function checkAdminSession() {
      try {
        const saved = localStorage.getItem(DEMO_USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setSession({ user: parsed });
        }
      } catch (err) {
        console.warn('Failed reading admin session from storage', err);
      }
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Attempt Supabase Cloud Auth if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          setUser(data.user);
          setSession(data.session);
          return data;
        }

        // If user doesn't exist yet in Supabase Auth, attempt auto-provisioning if configured
        if (ENV_ADMIN_EMAIL && cleanEmail === ENV_ADMIN_EMAIL) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: {
              data: { name: 'Director Yashu (Super Admin)' },
            },
          });

          if (!signUpError && signUpData?.user) {
            if (signUpData.session) {
              setUser(signUpData.user);
              setSession(signUpData.session);
              return signUpData;
            }

            if (signUpData.user.identities && signUpData.user.identities.length === 0) {
              throw new Error('Incorrect credentials. Please verify your email and password.');
            }

            throw new Error(
              'Admin account registered. Please check email confirmation if enabled in Supabase settings.'
            );
          }
        }

        if (error) {
          const isNetworkError =
            error.message?.toLowerCase().includes('failed to fetch') ||
            error.message?.toLowerCase().includes('network') ||
            error.status === 0;

          if (!isNetworkError) {
            throw new Error(error.message);
          }
        }
      } catch (err) {
        const isNetworkErr =
          err.message?.toLowerCase().includes('failed to fetch') ||
          err.message?.toLowerCase().includes('network') ||
          err.name === 'TypeError';

        if (!isNetworkErr) {
          throw err;
        }
      }
    }

    // 2. Built-in secure environment-variable admin verification
    if (ENV_ADMIN_EMAIL && cleanEmail === ENV_ADMIN_EMAIL && cleanPassword === ENV_ADMIN_PASSWORD) {
      const adminUser = {
        id: 'super-admin-user',
        email: cleanEmail,
        role: 'authenticated',
        user_metadata: { name: 'Director Yashu (Super Admin)' },
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
      setSession({ user: adminUser });
      return { user: adminUser, session: { user: adminUser } };
    }

    throw new Error('Invalid email or password. Please verify your credentials.');
  };

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out of Supabase:', e);
      }
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
    setSession(null);
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
