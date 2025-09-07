import { api } from '../api/client';
import { ApiResponse } from '@repo/types';

export class DashboardService {
  static async create(data: any): Promise<ApiResponse<any>> {
    const response = await api.post('/dashboard', data);
    return response.data;
  }

  static async getAll(): Promise<ApiResponse<any[]>> {
    const response = await api.get('/dashboard');
    return response.data;
  }

  static async getById(id: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/dashboard/${id}`);
    return response.data;
  }

  static async update(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await api.patch(`/dashboard/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/dashboard/${id}`);
    return response.data;
  }

  // Server-side methods for SSR
  static async getAllSSR(accessToken?: string): Promise<ApiResponse<any[]>> {
    const response = await api.get('/dashboard', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }

  static async getByIdSSR(id: string, accessToken?: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/dashboard/${id}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }
}
