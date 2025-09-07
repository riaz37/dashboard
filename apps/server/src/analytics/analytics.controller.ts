import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  CreateAnalyticsDataDto,
  GetAnalyticsDataDto,
  MetricType,
  TimeRange,
  ApiResponse,
} from '@repo/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('data')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAnalyticsDataDto: CreateAnalyticsDataDto,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const data = await this.analyticsService.create({
        ...createAnalyticsDataDto,
        userId: req.user.id,
      });
      return {
        success: true,
        data,
        message: 'Analytics data created successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('data')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('metricTypes') metricTypes?: string,
    @Query('timeRange') timeRange?: TimeRange,
    @Query('limit') limit?: number,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const parsedMetricTypes = metricTypes
        ? (metricTypes.split(',') as MetricType[])
        : undefined;

      const data = await this.analyticsService.findAll({
        userId: req.user.id,
        metricTypes: parsedMetricTypes,
        timeRange,
        limit,
      });

      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  async getMetrics(
    @Query('metricTypes') metricTypes?: string,
    @Query('timeRange') timeRange?: TimeRange,
    @Query('limit') limit?: number,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const parsedMetricTypes = metricTypes
        ? (metricTypes.split(',') as MetricType[])
        : undefined;

      const data = await this.analyticsService.findAll({
        userId: req.user.id,
        metricTypes: parsedMetricTypes,
        timeRange,
        limit,
      });

      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('metrics/:metricType')
  @UseGuards(JwtAuthGuard)
  async getMetricDetails(
    @Param('metricType') metricType: MetricType,
    @Query('timeRange') timeRange?: TimeRange,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const data = await this.analyticsService.getMetricDetails(
        req.user.id,
        metricType,
        timeRange || TimeRange.WEEK,
      );

      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('dashboard/:userId')
  @UseGuards(JwtAuthGuard)
  async getDashboardData(
    @Param('userId') userId: string,
    @Query('timeRange') timeRange?: TimeRange,
  ): Promise<ApiResponse<any>> {
    try {
      const data = await this.analyticsService.getDashboardData(
        userId,
        timeRange || TimeRange.WEEK,
      );

      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('health')
  async health(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { status: 'healthy', service: 'analytics' },
      timestamp: new Date(),
    };
  }
}
