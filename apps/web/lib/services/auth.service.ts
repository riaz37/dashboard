import { AuthService } from '../api/auth.service';
import { LoginDto, CreateUserDto, User } from '@repo/types';
import { useAuthStore } from '../store';

export class AuthBusinessService {
  static async login(credentials: LoginDto) {
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Update store
        useAuthStore.getState().setUser(user);
        
        return { success: true, user };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  }

  static async register(userData: CreateUserDto) {
    try {
      const response = await AuthService.register(userData);
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Update store
        useAuthStore.getState().setUser(user);
        
        return { success: true, user };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  }

  static async logout() {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and store
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      useAuthStore.getState().logout();
    }
  }

  static async refreshProfile() {
    try {
      const response = await AuthService.getProfile();
      
      if (response.success && response.data) {
        useAuthStore.getState().setUser(response.data);
        return { success: true, user: response.data };
      }
      
      return { success: false, error: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch profile' 
      };
    }
  }

  static async initializeAuth() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (token) {
      const result = await this.refreshProfile();
      if (!result.success) {
        // Token is invalid, clear it
        this.logout();
      }
    }
  }
}
