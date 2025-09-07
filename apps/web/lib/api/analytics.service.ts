import { api } from '../api/client';
import { 
  AnalyticsData, 
  CreateAnalyticsDataDto,
  GetAnalyticsDataDto,
  DashboardData,
  ApiResponse 
} from '@repo/types';

export class AnalyticsService {
  static async createData(data: CreateAnalyticsDataDto): Promise<ApiResponse<AnalyticsData>> {
    const response = await api.post('/analytics/data', data);
    return response.data;
  }

  static async getData(params: GetAnalyticsDataDto): Promise<ApiResponse<AnalyticsData[]>> {
    const response = await api.get('/analytics/data', { params });
    return response.data;
  }

  static async getMetrics(params: {
    metricTypes?: string;
    timeRange?: string;
    limit?: number;
  }): Promise<ApiResponse<AnalyticsData[]>> {
    const response = await api.get('/analytics/metrics', { params });
    return response.data;
  }

  static async getMetricDetails(
    metricType: string,
    timeRange?: string
  ): Promise<ApiResponse<any>> {
    const response = await api.get(`/analytics/metrics/${metricType}`, {
      params: { timeRange },
    });
    return response.data;
  }

  static async getDashboardData(
    userId: string,
    timeRange?: string
  ): Promise<ApiResponse<DashboardData>> {
    const response = await api.get(`/analytics/dashboard/${userId}`, {
      params: { timeRange },
    });
    return response.data;
  }

  // Server-side methods for SSR
  static async getDashboardDataSSR(
    userId: string,
    timeRange?: string,
    accessToken?: string
  ): Promise<ApiResponse<DashboardData>> {
    const response = await api.get(`/analytics/dashboard/${userId}`, {
      params: { timeRange },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }

  static async getMetricsSSR(
    params: {
      metricTypes?: string;
      timeRange?: string;
      limit?: number;
    },
    accessToken?: string
  ): Promise<ApiResponse<AnalyticsData[]>> {
    const response = await api.get('/analytics/metrics', {
      params,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  }
}
