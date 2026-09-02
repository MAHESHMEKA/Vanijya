import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PriceSource } from './enums';

export type MandiPriceDocument = MandiPrice & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'mandi_prices' })
export class MandiPrice {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, ref: 'Crop' })
  cropId: string;

  @Prop({ type: String, required: true, ref: 'Market' })
  marketId: string;

  @Prop({ type: Number, required: true })
  minPrice: number;

  @Prop({ type: Number, required: true })
  maxPrice: number;

  @Prop({ type: Number, required: true })
  modalPrice: number;

  @Prop({ type: Number, default: 0 })
  arrivalQuantity: number;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: PriceSource, default: PriceSource.MOCK })
  source: PriceSource;

  createdAt: Date;
}

export const MandiPriceSchema = SchemaFactory.createForClass(MandiPrice);

MandiPriceSchema.index({ cropId: 1, date: -1 });
MandiPriceSchema.index({ marketId: 1, date: -1 });
MandiPriceSchema.index({ cropId: 1, marketId: 1, date: -1 });
