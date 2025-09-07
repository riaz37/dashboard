import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsDataSchema,
  AnalyticsDataSchemaFactory,
} from './schemas/analytics-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AnalyticsData', schema: AnalyticsDataSchemaFactory },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
