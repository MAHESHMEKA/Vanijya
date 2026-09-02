import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionStatus } from './enums';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, unique: true, ref: 'CropLot' })
  lotId: string;

  @Prop({ type: String, required: true, ref: 'User' })
  buyerId: string;

  @Prop({ type: String, required: true, ref: 'User' })
  farmerId: string;

  @Prop({ type: String, required: true, unique: true, ref: 'Bid' })
  acceptedBidId: string;

  @Prop({ type: Number, required: true })
  agreedPrice: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({ type: String, enum: TransactionStatus, default: TransactionStatus.INITIATED })
  status: TransactionStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ buyerId: 1 });
TransactionSchema.index({ farmerId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });
