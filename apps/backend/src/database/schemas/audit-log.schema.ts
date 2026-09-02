import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AuditAction } from './enums';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, default: null, ref: 'Bid' })
  bidId?: string;

  @Prop({ type: String, default: null, ref: 'CropLot' })
  lotId?: string;

  @Prop({ type: String, required: true, ref: 'User' })
  actorId: string;

  @Prop({ type: String, enum: AuditAction, required: true })
  action: AuditAction;

  @Prop({ type: Number, default: null })
  oldQuantity?: number;

  @Prop({ type: Number, default: null })
  newQuantity?: number;

  @Prop({ type: String, default: null })
  oldStatus?: string;

  @Prop({ type: String, default: null })
  newStatus?: string;

  @Prop({ type: Number, default: null })
  price?: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  metadata?: any;

  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ lotId: 1 });
AuditLogSchema.index({ bidId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });
