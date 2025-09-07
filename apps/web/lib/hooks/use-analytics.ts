'use client';

import { useEffect, useCallback } from 'react';
import { useAnalyticsStore } from '../store';
import { AnalyticsBusinessService } from '../services/analytics.service';
import { useAuth } from './use-auth';

export function useAnalytics() {
  const { 
    dashboardData, 
    analyticsData, 
    timeRange, 
    isLoading, 
    setDashboardData, 
    setAnalyticsData, 
    setTimeRange, 
    setLoading 
  } = useAnalyticsStore();
  
  const { user } = useAuth();

  const loadDashboardData = useCallback(async (userId?: string, customTimeRange?: string) => {
    if (!userId && !user?.id) return { success: false, error: 'No user ID provided' };
    
    const result = await AnalyticsBusinessService.getDashboardData(
      userId || user!.id, 
      customTimeRange || timeRange
    );
    return result;
  }, [user?.id, timeRange]);

  const loadMetrics = useCallback(async (params: {
    metricTypes?: string;
    timeRange?: string;
    limit?: number;
  }) => {
    const result = await AnalyticsBusinessService.getMetrics(params);
    return result;
  }, []);

  const createData = useCallback(async (data: any) => {
    const result = await AnalyticsBusinessService.createData(data);
    return result;
  }, []);

  const updateTimeRange = useCallback((newTimeRange: string) => {
    setTimeRange(newTimeRange);
  }, [setTimeRange]);

  const getMetricDetails = useCallback(async (metricType: string, customTimeRange?: string) => {
    const result = await AnalyticsBusinessService.getMetricDetails(
      metricType, 
      customTimeRange || timeRange
    );
    return result;
  }, [timeRange]);

  // Auto-load dashboard data when user or timeRange changes
  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, timeRange, loadDashboardData]);

  return {
    dashboardData,
    analyticsData,
    timeRange,
    isLoading,
    loadDashboardData,
    loadMetrics,
    createData,
    updateTimeRange,
    getMetricDetails,
    // Utility functions
    calculateGrowthRate: AnalyticsBusinessService.calculateGrowthRate,
    getTrendDirection: AnalyticsBusinessService.getTrendDirection,
    formatChartData: AnalyticsBusinessService.formatChartData,
  };
}
