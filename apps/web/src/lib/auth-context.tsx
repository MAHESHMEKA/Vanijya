'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'FARMER' | 'BUYER' | 'ADMIN';
  district?: string;
  state?: string;
  location?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, selectedRole?: 'FARMER' | 'BUYER' | 'ADMIN') => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({} as User),
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadSession = async () => {
    try {
      const storedToken = localStorage.getItem('vanijya_token');
      const storedUser = localStorage.getItem('vanijya_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('vanijya_token');
      localStorage.removeItem('vanijya_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (identifier: string, password: string, selectedRole?: 'FARMER' | 'BUYER' | 'ADMIN'): Promise<User> => {
    try {
      const res = await api.post<{ accessToken: string; user: User }>('/auth/login', {
        identifier,
        password,
      });

      let loggedInUser = res.user;

      // If user chose a specific role and it's valid, respect the role context
      if (selectedRole && loggedInUser.role !== selectedRole && loggedInUser.role === 'ADMIN') {
        loggedInUser = { ...loggedInUser, role: selectedRole };
      }

      setToken(res.accessToken);
      setUser(loggedInUser);

      localStorage.setItem('vanijya_token', res.accessToken);
      localStorage.setItem('vanijya_user', JSON.stringify(loggedInUser));

      return loggedInUser;
    } catch (err: any) {
      throw new Error(err.message || 'Login failed. Please check credentials.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vanijya_token');
    localStorage.removeItem('vanijya_user');
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await api.get<User>('/users/me');
      setUser(updatedUser);
      localStorage.setItem('vanijya_user', JSON.stringify(updatedUser));
    } catch {
      // Ignore if offline
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
