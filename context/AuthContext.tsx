'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  addresses: Address[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  registerFull: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateAddresses: (addresses: Address[]) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial check of session
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '', session.user.user_metadata);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking user session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, email: string, metaData: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setUser({
        id: userId,
        email: email,
        name: profile?.full_name || metaData?.full_name || metaData?.name || 'Amuraa User',
        role: (email === 'byamuraa@gmail.com' || profile?.is_admin) ? 'admin' : 'user',
        addresses: profile?.addresses || [],
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Fallback if trigger hasn't finished or profile table fails
      setUser({
        id: userId,
        email: email,
        name: metaData?.full_name || metaData?.name || 'Amuraa User',
        role: email === 'byamuraa@gmail.com' ? 'admin' : 'user',
        addresses: [],
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error('Google Sign In failed:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id, data.user.email || '', data.user.user_metadata);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const registerFull = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      if (data.user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '', session.user.user_metadata);
        }
      }
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const register = async (name: string, email: string) => {
    return { success: false, error: 'Standard registration requires a password. Please use registerFull.' };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateAddresses = async (addresses: Address[]) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { success: false, error: 'Not authenticated' };

      const formattedAddresses = addresses.map(addr => ({
        ...addr,
        _id: addr._id || 'addr_' + Math.random().toString(36).substr(2, 9)
      }));

      const { error } = await supabase
        .from('profiles')
        .update({ addresses: formattedAddresses })
        .eq('id', authUser.id);

      if (error) throw error;

      setUser((prev) => (prev ? { ...prev, addresses: formattedAddresses } : null));
      return { success: true };
    } catch (err: any) {
      console.error('Update addresses error:', err);
      return { success: false, error: err.message || 'Failed to update addresses' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerFull, loginWithGoogle, logout, updateAddresses }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
