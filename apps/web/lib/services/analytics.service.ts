import { AnalyticsService } from '@/lib/api/analytics.service';
import {
  CreateAnalyticsDataDto,
  AnalyticsData,
} from '@repo/types';
import { useAnalyticsStore } from '@/lib/store';

export class AnalyticsBusinessService {
  static async createData(data: CreateAnalyticsDataDto) {
    try {
      const response = await AnalyticsService.createData(data);

      if (response.success && response.data) {
        // Add to store
        useAnalyticsStore.getState().addAnalyticsData(response.data);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create analytics data'
      };
    }
  }

  static async getDashboardData(userId: string, timeRange?: string) {
    try {
      useAnalyticsStore.getState().setLoading(true);

      const response = await AnalyticsService.getDashboardData(userId, timeRange);

      if (response.success && response.data) {
        useAnalyticsStore.getState().setDashboardData(response.data);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    } finally {
      useAnalyticsStore.getState().setLoading(false);
    }
  }

  static async getMetrics(params: {
    metricTypes?: string;
    timeRange?: string;
    limit?: number;
  }) {
    try {
      useAnalyticsStore.getState().setLoading(true);

      const response = await AnalyticsService.getMetrics(params);

      if (response.success && response.data) {
        useAnalyticsStore.getState().setAnalyticsData(response.data);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch metrics'
      };
    } finally {
      useAnalyticsStore.getState().setLoading(false);
    }
  }

  static async getMetricDetails(metricType: string, timeRange?: string) {
    try {
      const response = await AnalyticsService.getMetricDetails(metricType, timeRange);

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return { success: false, error: response.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch metric details'
      };
    }
  }

  static async updateTimeRange(timeRange: string) {
    useAnalyticsStore.getState().setTimeRange(timeRange);
  }

  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  static getTrendDirection(growthRate: number): 'up' | 'down' | 'stable' {
    if (growthRate > 0.1) return 'up';
    if (growthRate < -0.1) return 'down';
    return 'stable';
  }

  static formatChartData(data: AnalyticsData[], metricType: string) {
    return data
      .filter(item => item.metricType === metricType)
      .map(item => ({
        name: new Date(item.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        value: item.value,
        timestamp: item.timestamp,
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}
