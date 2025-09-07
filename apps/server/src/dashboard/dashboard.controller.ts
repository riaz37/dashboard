import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  CreateDashboardDto,
  UpdateDashboardDto,
  ApiResponse,
} from '@repo/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createDashboardDto: CreateDashboardDto,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const dashboard = await this.dashboardService.create(
        createDashboardDto,
        req.user.id,
      );

      return {
        success: true,
        data: dashboard,
        message: 'Dashboard created successfully',
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

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req): Promise<ApiResponse<any>> {
    try {
      const dashboards = await this.dashboardService.findAll(req.user.id);

      return {
        success: true,
        data: dashboards,
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

  @Get('public')
  async findPublic(): Promise<ApiResponse<any>> {
    try {
      const dashboards = await this.dashboardService.findPublic();

      return {
        success: true,
        data: dashboards,
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const dashboard = await this.dashboardService.findOne(id, req.user.id);

      return {
        success: true,
        data: dashboard,
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    try {
      const dashboard = await this.dashboardService.update(
        id,
        updateDashboardDto,
        req.user.id,
      );

      return {
        success: true,
        data: dashboard,
        message: 'Dashboard updated successfully',
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponse<void>> {
    try {
      await this.dashboardService.remove(id, req.user.id);

      return {
        success: true,
        message: 'Dashboard deleted successfully',
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
}
