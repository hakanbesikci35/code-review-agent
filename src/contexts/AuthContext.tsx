// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'lstai_auth_token';
const USER_KEY = 'lstai_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load auth data from localStorage if exists
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data', e);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simple mock login rules
      if (!email.includes('@') || password.length < 4) {
        throw new Error('Geçersiz e-posta adresi veya şifre (en az 4 karakter).');
      }

      // Determine role based on email for testing different roles
      let role: UserRole = 'developer';
      if (email.startsWith('admin')) {
        role = 'admin';
      } else if (email.startsWith('viewer')) {
        role = 'viewer';
      }

      if (role !== 'admin') {
        throw new Error('Erişim engellendi. Bu sisteme sadece Yönetici (admin) rolündeki hesaplar giriş yapabilir.');
      }

      const name = email.split('@')[0].toUpperCase();

      const mockUser: User = {
        id: `usr_${Math.random().toString(36).slice(2, 11)}`,
        email,
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        role,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        tenantId: 'tenant_default_123',
      };

      const mockToken = `mock_jwt_token_${Math.random().toString(36).slice(2, 22)}`;

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
