import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AnalyticsData, MetricType } from '@repo/types';

export type AnalyticsDataDocument = AnalyticsData & Document;

@Schema({ timestamps: true })
export class AnalyticsDataSchema {
  @Prop({ required: true, enum: Object.values(MetricType) })
  metricType: MetricType;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: [String] })
  tags?: string[];
}

export const AnalyticsDataSchemaFactory =
  SchemaFactory.createForClass(AnalyticsDataSchema);

// Create indexes for better performance
AnalyticsDataSchemaFactory.index({ userId: 1, timestamp: -1 });
AnalyticsDataSchemaFactory.index({ metricType: 1, timestamp: -1 });
AnalyticsDataSchemaFactory.index({ userId: 1, metricType: 1, timestamp: -1 });
