import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user || data);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password, remember = false) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: userData } = data;
    localStorage.setItem('accessToken', accessToken);
    if (remember) localStorage.setItem('refreshToken', refreshToken);
    else sessionStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
    const redirectMap = {
      client: '/dashboard',
      prestataire: '/provider/dashboard',
      admin: '/admin',
    };
    navigate(redirectMap[userData.role] || '/dashboard');
    return userData;
  }, [navigate]);

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    toast.success('Registration successful! Please check your email to verify your account.');
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      // silent
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (!token) throw new Error('No refresh token');
    const { data } = await api.post('/auth/refresh', { refreshToken: token });
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
