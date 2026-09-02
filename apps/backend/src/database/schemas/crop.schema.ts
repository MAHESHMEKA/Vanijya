import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CropUnit } from './enums';

export type CropDocument = Crop & Document;

@Schema({ timestamps: true, collection: 'crops' })
export class Crop {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, unique: true, trim: true })
  name: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, enum: CropUnit, default: CropUnit.QUINTAL })
  defaultUnit: CropUnit;

  createdAt: Date;
  updatedAt: Date;
}

export const CropSchema = SchemaFactory.createForClass(Crop);
