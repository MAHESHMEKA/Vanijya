import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role, VerificationStatus, ApprovalStatus } from './enums';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class GeoPointLocation {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}
export const GeoPointLocationSchema = SchemaFactory.createForClass(GeoPointLocation);

@Schema({ _id: false })
export class ProfilePhoto {
  @Prop({ type: String, default: null })
  fileId?: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, default: 'image/jpeg' })
  mimeType?: string;

  @Prop({ type: Number, default: 0 })
  size?: number;

  @Prop({ type: Date, default: Date.now })
  uploadedAt?: Date;
}
export const ProfilePhotoSchema = SchemaFactory.createForClass(ProfilePhoto);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, unique: true, sparse: true, trim: true })
  phone?: string;

  @Prop({ type: String, unique: true, sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, enum: Role, default: Role.FARMER })
  role: Role;

  @Prop({ type: String, enum: VerificationStatus, default: VerificationStatus.PENDING })
  verificationStatus: VerificationStatus;

  @Prop({ type: String, enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  approvalStatus: ApprovalStatus;

  @Prop({ type: String, default: null })
  rejectionReason?: string;

  @Prop({ type: String, default: null })
  approvedBy?: string;

  @Prop({ type: Date, default: null })
  approvedAt?: Date;

  @Prop({ type: ProfilePhotoSchema, default: null })
  profilePhoto?: ProfilePhoto;

  @Prop({ type: String, default: null })
  location?: string;

  @Prop({ type: GeoPointLocationSchema, default: null })
  geoPoint?: GeoPointLocation;

  @Prop({ type: String, default: null })
  district?: string;

  @Prop({ type: String, default: null })
  state?: string;

  @Prop({ type: String, default: null })
  village?: string;

  @Prop({ type: String, default: null })
  primaryCrop?: string;

  @Prop({ type: Number, default: null })
  farmSize?: number;

  @Prop({ type: String, default: 'en' })
  preferredLanguage?: string;

  @Prop({ type: String, default: null })
  organization?: string;

  @Prop({ type: String, default: null })
  contactPerson?: string;

  @Prop({ type: String, default: null })
  businessType?: string;

  @Prop({ type: String, default: null })
  warehouseLocation?: string;

  @Prop({ type: String, default: null })
  gstin?: string;

  @Prop({ type: String, default: null })
  fssai?: string;

  @Prop({ type: String, default: null })
  kccNumber?: string;

  @Prop({ type: String, default: null })
  apmcLicense?: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 2dsphere index on geoPoint
UserSchema.index({ geoPoint: '2dsphere' });
UserSchema.index({ role: 1 });
UserSchema.index({ approvalStatus: 1 });
UserSchema.index({ verificationStatus: 1 });
UserSchema.index({ district: 1 });
UserSchema.index({ state: 1 });
