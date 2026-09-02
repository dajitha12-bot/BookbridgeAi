'use client';

import { useContext } from 'react';
import { AuthContext, UserContextType } from '../components/AuthProvider';

export function useAuth(): UserContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
