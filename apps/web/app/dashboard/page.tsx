'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { MetricCard } from '@/components/analytics/metric-card';
import { ChartCard } from '@/components/analytics/chart-card';
import { LineChartComponent } from '@/components/analytics/line-chart';
import { BarChartComponent } from '@/components/analytics/bar-chart';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { useAuth } from '@/lib/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

// Mock data for demonstration
const mockMetrics = [
  {
    title: 'Total Users',
    value: '12,345',
    change: 12.5,
    trend: 'up' as const,
    icon: Users,
    description: 'Active users this month'
  },
  {
    title: 'Page Views',
    value: '1.2M',
    change: 8.2,
    trend: 'up' as const,
    icon: Eye,
    description: 'Total page views'
  },
  {
    title: 'Click Rate',
    value: '3.2%',
    change: -2.1,
    trend: 'down' as const,
    icon: MousePointer,
    description: 'Average click-through rate'
  },
  {
    title: 'Revenue',
    value: '$45,678',
    change: 15.3,
    trend: 'up' as const,
    icon: TrendingUp,
    description: 'Monthly revenue'
  }
];

const mockChartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
];

const mockBarData = [
  { name: 'Mobile', value: 4000 },
  { name: 'Desktop', value: 3000 },
  { name: 'Tablet', value: 2000 },
  { name: 'Other', value: 1000 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    dashboardData, 
    timeRange, 
    isLoading, 
    updateTimeRange,
    formatChartData 
  } = useAnalytics();

  useEffect(() => {
    if (user?.id) {
      // Load dashboard data when user is available
      // This will be handled by the useAnalytics hook
    }
  }, [user?.id]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.username || 'User'}! Here's what's happening with your analytics.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              icon={metric.icon}
              description={metric.description}
            />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard
            title="User Growth"
            description="Monthly user growth over time"
            icon={Activity}
            timeRange={timeRange}
            onTimeRangeChange={updateTimeRange}
          >
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <LineChartComponent
                data={mockChartData}
                dataKey="value"
                color="#3b82f6"
                height={300}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Traffic Sources"
            description="Traffic breakdown by device type"
            icon={BarChart3}
          >
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <BarChartComponent
                data={mockBarData}
                dataKey="value"
                color="#10b981"
                height={300}
              />
            )}
          </ChartCard>
        </div>

        {/* Additional Charts Row */}
        <div className="grid gap-6 md:grid-cols-3">
          <ChartCard
            title="Conversion Rate"
            description="Daily conversion rates"
            icon={TrendingUp}
          >
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <LineChartComponent
                data={mockChartData.slice(0, 5)}
                dataKey="value"
                color="#f59e0b"
                height={200}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Page Views"
            description="Top pages by views"
            icon={Eye}
          >
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <BarChartComponent
                data={mockBarData.slice(0, 3)}
                dataKey="value"
                color="#ef4444"
                height={200}
              />
            )}
          </ChartCard>

          <ChartCard
            title="User Engagement"
            description="Average session duration"
            icon={Users}
          >
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <LineChartComponent
                data={mockChartData.slice(2, 7)}
                dataKey="value"
                color="#8b5cf6"
                height={200}
              />
            )}
          </ChartCard>
        </div>
      </div>
    </MainLayout>
  );
}
