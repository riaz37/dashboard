import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  DashboardSchema,
  DashboardSchemaFactory,
} from './schemas/dashboard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Dashboard', schema: DashboardSchemaFactory },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
