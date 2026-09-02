import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CropLotStatus, QualityGrade } from './enums';
import { GeoPointLocation, GeoPointLocationSchema } from './user.schema';

export type CropLotDocument = CropLot & Document;

@Schema({ timestamps: true, collection: 'crop_lots' })
export class CropLot {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, ref: 'User' })
  farmerId: string;

  @Prop({ type: String, required: true, ref: 'Crop' })
  cropId: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, default: 'QUINTAL' })
  unit: string;

  @Prop({ type: Number, required: true })
  expectedPrice: number;

  @Prop({ type: String, enum: QualityGrade, default: QualityGrade.GRADE_A })
  qualityGrade: QualityGrade;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: GeoPointLocationSchema, default: null })
  geoPoint?: GeoPointLocation;

  @Prop({ type: Date, default: null })
  harvestDate?: Date;

  @Prop({ type: String, enum: CropLotStatus, default: CropLotStatus.OPEN })
  status: CropLotStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const CropLotSchema = SchemaFactory.createForClass(CropLot);

CropLotSchema.index({ farmerId: 1 });
CropLotSchema.index({ cropId: 1 });
CropLotSchema.index({ status: 1 });
CropLotSchema.index({ createdAt: -1 });
CropLotSchema.index({ geoPoint: '2dsphere' });
