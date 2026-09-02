'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getMeAction, logoutAction } from '../actions/authActions';

export interface UserContextType {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const me = await getMeAction();
      setUser(me);
    } catch (e) {
      console.error('Failed to load profile', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutAction();
      setUser(null);
      window.location.href = '/login';
    } catch (e) {
      console.error('Failed to log out', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
