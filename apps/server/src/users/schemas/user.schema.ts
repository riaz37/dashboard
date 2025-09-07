import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User, UserPreferences, UserStats } from '@repo/types';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class UserSchema {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatar?: string;

  @Prop({
    type: Object,
    default: () => ({
      theme: 'light',
      notifications: true,
      timezone: 'UTC',
      language: 'en',
    }),
  })
  preferences: UserPreferences;

  @Prop({
    type: Object,
    default: () => ({
      gamesPlayed: 0,
      gamesWon: 0,
      rating: 1000,
      achievements: [],
    }),
  })
  stats: UserStats;
}

export const UserSchemaFactory = SchemaFactory.createForClass(UserSchema);
