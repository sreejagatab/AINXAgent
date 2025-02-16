import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../lib/api';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useLocalStorage<string | null>('token', null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          handleLogout();
        } else {
          loadUser();
        }
      } catch {
        handleLogout();
      }
    }
    setIsLoading(false);
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    api.defaults.headers.Authorization = undefined;
    navigate('/login');
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
    navigate('/dashboard');
  };

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
    navigate('/dashboard');
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token: newToken } = response.data;
      
      setToken(newToken);
      api.defaults.headers.Authorization = `Bearer ${newToken}`;
    } catch {
      handleLogout();
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout: handleLogout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 