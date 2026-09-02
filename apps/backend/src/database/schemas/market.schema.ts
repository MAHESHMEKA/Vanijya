import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeoPointLocation, GeoPointLocationSchema } from './user.schema';

export type MarketDocument = Market & Document;

@Schema({ timestamps: true, collection: 'markets' })
export class Market {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true })
  district: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: Number, default: null })
  latitude?: number;

  @Prop({ type: Number, default: null })
  longitude?: number;

  @Prop({ type: GeoPointLocationSchema, default: null })
  geoPoint?: GeoPointLocation;

  createdAt: Date;
  updatedAt: Date;
}

export const MarketSchema = SchemaFactory.createForClass(Market);

MarketSchema.index({ geoPoint: '2dsphere' });
MarketSchema.index({ state: 1, district: 1 });
