import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dashboard, CreateDashboardDto, UpdateDashboardDto } from '@repo/types';
import { DashboardDocument } from './schemas/dashboard.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Dashboard') private dashboardModel: Model<DashboardDocument>,
  ) {}

  async create(
    createDashboardDto: CreateDashboardDto,
    userId: string,
  ): Promise<Dashboard> {
    const dashboard = new this.dashboardModel({
      ...createDashboardDto,
      userId,
    });

    const saved = await dashboard.save();
    return this.toDashboardDto(saved);
  }

  async findAll(userId: string): Promise<Dashboard[]> {
    const dashboards = await this.dashboardModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return dashboards.map((dashboard) => this.toDashboardDto(dashboard));
  }

  async findOne(id: string, userId: string): Promise<Dashboard> {
    const dashboard = await this.dashboardModel.findOne({ _id: id, userId });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.toDashboardDto(dashboard);
  }

  async update(
    id: string,
    updateDashboardDto: UpdateDashboardDto,
    userId: string,
  ): Promise<Dashboard> {
    const dashboard = await this.dashboardModel.findOneAndUpdate(
      { _id: id, userId },
      updateDashboardDto,
      { new: true },
    );

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.toDashboardDto(dashboard);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.dashboardModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!result) {
      throw new NotFoundException('Dashboard not found');
    }
  }

  async findPublic(): Promise<Dashboard[]> {
    const dashboards = await this.dashboardModel
      .find({ isPublic: true })
      .sort({ createdAt: -1 });

    return dashboards.map((dashboard) => this.toDashboardDto(dashboard));
  }

  private toDashboardDto(dashboard: DashboardDocument): Dashboard {
    return {
      id: dashboard._id.toString(),
      userId: dashboard.userId,
      title: dashboard.title,
      description: dashboard.description,
      widgets: dashboard.widgets,
      isPublic: dashboard.isPublic,
      createdAt: dashboard.createdAt,
      updatedAt: dashboard.updatedAt,
    };
  }
}
