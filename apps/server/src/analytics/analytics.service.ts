import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AnalyticsData,
  CreateAnalyticsDataDto,
  GetAnalyticsDataDto,
  MetricType,
  TimeRange,
  MetricDetails,
  DashboardData,
} from '@repo/types';
import { AnalyticsDataDocument } from './schemas/analytics-data.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel('AnalyticsData')
    private analyticsModel: Model<AnalyticsDataDocument>,
  ) {}

  async create(
    createAnalyticsDataDto: CreateAnalyticsDataDto,
  ): Promise<AnalyticsData> {
    const analyticsData = new this.analyticsModel(createAnalyticsDataDto);
    const saved = await analyticsData.save();
    return this.toAnalyticsDataDto(saved);
  }

  async findAll(
    getAnalyticsDataDto: GetAnalyticsDataDto,
  ): Promise<AnalyticsData[]> {
    const { userId, metricTypes, timeRange, limit } = getAnalyticsDataDto;

    const query: any = { userId };

    if (metricTypes && metricTypes.length > 0) {
      query.metricType = { $in: metricTypes };
    }

    if (timeRange) {
      const timeFilter = this.parseTimeRange(timeRange);
      query.timestamp = { $gte: timeFilter };
    }

    const data = await this.analyticsModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit || 100);

    return data.map((item) => this.toAnalyticsDataDto(item));
  }

  async findByMetricType(
    userId: string,
    metricType: MetricType,
    timeRange?: TimeRange,
  ): Promise<AnalyticsData[]> {
    const query: any = { userId, metricType };

    if (timeRange) {
      const timeFilter = this.parseTimeRange(timeRange);
      query.timestamp = { $gte: timeFilter };
    }

    const data = await this.analyticsModel.find(query).sort({ timestamp: -1 });

    return data.map((item) => this.toAnalyticsDataDto(item));
  }

  async getMetricDetails(
    userId: string,
    metricType: MetricType,
    timeRange: TimeRange = TimeRange.WEEK,
  ): Promise<MetricDetails> {
    const data = await this.findByMetricType(userId, metricType, timeRange);

    if (data.length === 0) {
      return {
        metricType,
        currentValue: 0,
        trend: 'stable',
        dataPoints: [],
        summary: 'No data available',
      };
    }

    const currentValue = data[0].value;
    const previousValue = data.length > 1 ? data[1].value : undefined;

    let changePercentage: number | undefined;
    if (previousValue !== undefined && previousValue !== 0) {
      changePercentage = ((currentValue - previousValue) / previousValue) * 100;
    }

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercentage !== undefined) {
      if (changePercentage > 5) {
        trend = 'up';
      } else if (changePercentage < -5) {
        trend = 'down';
      }
    }

    const summary = this.generateMetricSummary(
      metricType,
      currentValue,
      changePercentage,
    );

    return {
      metricType,
      currentValue,
      previousValue,
      changePercentage,
      trend,
      dataPoints: data,
      summary,
    };
  }

  async getDashboardData(
    userId: string,
    timeRange: TimeRange = TimeRange.WEEK,
  ): Promise<DashboardData> {
    const metricTypes = Object.values(MetricType);
    const metrics: MetricDetails[] = [];

    for (const metricType of metricTypes) {
      const metricDetails = await this.getMetricDetails(
        userId,
        metricType,
        timeRange,
      );
      if (metricDetails.dataPoints.length > 0) {
        metrics.push(metricDetails);
      }
    }

    const insights = this.generateInsights(metrics);

    return {
      userId,
      metrics,
      insights,
      lastUpdated: new Date(),
      timeRange,
    };
  }

  async getAnalyticsData(userId: string, queryParams: any): Promise<any> {
    const { metricTypes, timeRange, limit } = queryParams;

    const data = await this.findAll({
      userId,
      metricTypes,
      timeRange,
      limit,
    });

    return {
      data,
      count: data.length,
      queryParams,
    };
  }

  private parseTimeRange(timeRange: TimeRange): Date {
    const now = new Date();

    switch (timeRange) {
      case TimeRange.HOUR:
        return new Date(now.getTime() - 60 * 60 * 1000);
      case TimeRange.DAY:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case TimeRange.WEEK:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case TimeRange.MONTH:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case TimeRange.QUARTER:
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case TimeRange.YEAR:
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private generateMetricSummary(
    metricType: MetricType,
    currentValue: number,
    changePercentage?: number,
  ): string {
    const metricName = metricType.replace(/_/g, ' ').toUpperCase();

    if (changePercentage === undefined) {
      return `Current ${metricName}: ${currentValue}`;
    }

    const direction = changePercentage > 0 ? 'increased' : 'decreased';
    const percentage = Math.abs(changePercentage).toFixed(1);

    return `${metricName} ${direction} by ${percentage}% to ${currentValue}`;
  }

  private generateInsights(metrics: MetricDetails[]): string[] {
    const insights: string[] = [];

    // Find top performing metric
    const topMetric = metrics.reduce((prev, current) =>
      (current.changePercentage || 0) > (prev.changePercentage || 0)
        ? current
        : prev,
    );

    if (topMetric.changePercentage && topMetric.changePercentage > 10) {
      insights.push(
        `${topMetric.metricType} is performing exceptionally well with ${topMetric.changePercentage.toFixed(1)}% growth`,
      );
    }

    // Find declining metric
    const decliningMetric = metrics.find(
      (m) => m.changePercentage && m.changePercentage < -10,
    );
    if (decliningMetric) {
      insights.push(
        `${decliningMetric.metricType} needs attention with ${decliningMetric.changePercentage.toFixed(1)}% decline`,
      );
    }

    // General insights
    const totalMetrics = metrics.length;
    const positiveMetrics = metrics.filter(
      (m) => m.changePercentage && m.changePercentage > 0,
    ).length;

    if (positiveMetrics / totalMetrics > 0.7) {
      insights.push('Most metrics are showing positive trends');
    } else if (positiveMetrics / totalMetrics < 0.3) {
      insights.push('Most metrics are declining - review your strategy');
    }

    return insights.length > 0
      ? insights
      : ['Continue monitoring your metrics for insights'];
  }

  private toAnalyticsDataDto(data: AnalyticsDataDocument): AnalyticsData {
    return {
      id: data._id.toString(),
      metricType: data.metricType,
      value: data.value,
      userId: data.userId,
      timestamp: data.timestamp,
      metadata: data.metadata,
      tags: data.tags,
    };
  }
}
