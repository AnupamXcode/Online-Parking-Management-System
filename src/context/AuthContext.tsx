import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Vehicle } from '../types';
import { apiRequest } from '../api';

interface AuthContextType {
  user: User | null;
  vehicles: Vehicle[];
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLogin: (role: 'user' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('parkease_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('parkease_token')) {
        setUser(null);
        setVehicles([]);
        setLoading(false);
        return;
      }
      const data = await apiRequest('/auth/me');
      setUser(data.user);
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.warn('Failed to fetch current user session:', err);
      localStorage.removeItem('parkease_token');
      setToken(null);
      setUser(null);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('parkease_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await fetchCurrentUser();
  };

  const register = async (payload: any) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem('parkease_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await fetchCurrentUser();
  };

  const logout = () => {
    try {
      apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    localStorage.removeItem('parkease_token');
    setToken(null);
    setUser(null);
    setVehicles([]);
  };

  const quickLogin = async (role: 'user' | 'admin') => {
    if (role === 'admin') {
      await login('admin@parkease.com', 'AdminPass123!');
    } else {
      await login('anupam@example.com', 'UserPass123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vehicles,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        quickLogin
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
