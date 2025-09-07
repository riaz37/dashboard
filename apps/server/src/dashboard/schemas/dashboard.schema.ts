import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Dashboard, DashboardWidget } from '@repo/types';

export type DashboardDocument = Dashboard & Document;

@Schema({ timestamps: true })
export class DashboardSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Object], default: [] })
  widgets: DashboardWidget[];

  @Prop({ default: false })
  isPublic: boolean;
}

export const DashboardSchemaFactory =
  SchemaFactory.createForClass(DashboardSchema);

// Create indexes for better performance
DashboardSchemaFactory.index({ userId: 1, createdAt: -1 });
DashboardSchemaFactory.index({ isPublic: 1 });
