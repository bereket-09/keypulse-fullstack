'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('keypulse_token');
    const savedUser = localStorage.getItem('keypulse_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token in background
        api.getCurrentUser()
          .then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('keypulse_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('keypulse_token', response.token);
    localStorage.setItem('keypulse_user', JSON.stringify(response.user));
    router.push('/dashboard');
  };

  const register = async (fullName: string, email: string, password: string) => {
    const response = await api.register({ fullName, email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('keypulse_token', response.token);
    localStorage.setItem('keypulse_user', JSON.stringify(response.user));
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('keypulse_token');
    localStorage.removeItem('keypulse_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
