/**
 * useAuth — manages login, logout, and current user profile.
 * Usage: const { user, token, loading, loginError, login, logout, updateProfile } = useAuth();
 */
import { useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../lib/api';
import { toastSuccess, toastError } from '../lib/toast';

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('morango_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('morango_token', token);
      fetchMe();
    } else {
      localStorage.removeItem('morango_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch {
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoginError(null);
    try {
      const data = await api.post('/auth/login', { email, password });
      setToken(data.token);
      toastSuccess('Welcome back!');
    } catch (e: any) {
      setLoginError(e.message || 'Authentication failed');
      toastError(e.message || 'Authentication failed');
    }
  };

  const logout = () => {
    setToken(null);
    toastSuccess('Logged out successfully');
  };

  const updateProfile = async (form: { name: string; email: string; password: string }) => {
    try {
      const data = await api.put('/auth/me', form);
      setUser(data);
      toastSuccess('Profile updated successfully!');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to update profile');
      return { ok: false, error: e.message || 'Failed to update profile' };
    }
  };

  return { token, user, loading, loginError, login, logout, updateProfile, refetch: fetchMe };
}
