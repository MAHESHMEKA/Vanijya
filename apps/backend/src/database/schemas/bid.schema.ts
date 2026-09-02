import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BidStatus } from './enums';

export type BidDocument = Bid & Document;

@Schema({ timestamps: true, collection: 'bids' })
export class Bid {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, ref: 'CropLot' })
  lotId: string;

  @Prop({ type: String, required: true, ref: 'User' })
  buyerId: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, default: null })
  message?: string;

  @Prop({ type: String, enum: BidStatus, default: BidStatus.PENDING })
  status: BidStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const BidSchema = SchemaFactory.createForClass(Bid);

BidSchema.index({ lotId: 1 });
BidSchema.index({ buyerId: 1 });
BidSchema.index({ status: 1 });
BidSchema.index({ createdAt: -1 });
