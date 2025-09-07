import { api } from '@/lib/api';
import { User, ApiResponse } from '@repo/types';

export class UsersService {
  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/users/profile');
    return response.data;
  }

  static async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  static async getLeaderboard(limit?: number): Promise<ApiResponse<User[]>> {
    const response = await api.get(`/users/leaderboard?limit=${limit || 10}`);
    return response.data;
  }

  // Server-side methods for SSR
  static async getProfileSSR(accessToken?: string): Promise<ApiResponse<User>> {
    const response = await api.get('/users/profile', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }

  static async getLeaderboardSSR(
    limit?: number,
    accessToken?: string
  ): Promise<ApiResponse<User[]>> {
    const response = await api.get(`/users/leaderboard?limit=${limit || 10}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }
}
