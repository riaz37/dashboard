'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { AuthBusinessService } from '@/lib/services/auth.service';
import { LoginDto, CreateUserDto } from '@repo/types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth on mount
    AuthBusinessService.initializeAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    setLoading(true);
    const result = await AuthBusinessService.login(credentials);
    setLoading(false);
    return result;
  };

  const register = async (userData: CreateUserDto) => {
    setLoading(true);
    const result = await AuthBusinessService.register(userData);
    setLoading(false);
    return result;
  };

  const handleLogout = async () => {
    setLoading(true);
    await AuthBusinessService.logout();
    setLoading(false);
  };

  const refreshProfile = async () => {
    setLoading(true);
    const result = await AuthBusinessService.refreshProfile();
    setLoading(false);
    return result;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
    refreshProfile,
  };
}
