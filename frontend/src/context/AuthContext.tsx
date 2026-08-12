import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/apiServices';
import { setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('devflow_access_token');
      if (token) {
        setAuthToken(token);
        try {
          const currentUser = await authApi.me();
          setUser(currentUser);
        } catch (err) {
          console.error('Failed to load current user:', err);
          setAuthToken(null);
          localStorage.removeItem('devflow_access_token');
          localStorage.removeItem('devflow_refresh_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: any) => {
    const response = await authApi.login(data);
    setAuthToken(response.accessToken);
    localStorage.setItem('devflow_refresh_token', response.refreshToken);
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authApi.register(data);
    setAuthToken(response.accessToken);
    localStorage.setItem('devflow_refresh_token', response.refreshToken);
    setUser(response.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('devflow_refresh_token');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setAuthToken(null);
    localStorage.removeItem('devflow_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
