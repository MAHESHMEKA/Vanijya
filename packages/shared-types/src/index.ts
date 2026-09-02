/**
 * Vanijya Shared Types & Domain Enums
 * Smart India Hackathon (SIH) Problem Statement 26132
 */

export enum UserRole {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CropLotStatus {
  OPEN = 'OPEN',
  BIDDING = 'BIDDING',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum TransactionStatus {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  INITIATED = 'INITIATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum QualityGrade {
  GRADE_A = 'GRADE_A',
  GRADE_B = 'GRADE_B',
  GRADE_C = 'GRADE_C',
}

export enum CropUnit {
  QUINTAL = 'QUINTAL',
  KG = 'KG',
  TONNE = 'TONNE',
}

export enum AuditAction {
  LOT_CREATED = 'LOT_CREATED',
  BID_PLACED = 'BID_PLACED',
  QUANTITY_MODIFIED = 'QUANTITY_MODIFIED',
  BID_CANCELLED = 'BID_CANCELLED',
  BID_ACCEPTED = 'BID_ACCEPTED',
  BID_REJECTED = 'BID_REJECTED',
  PAYMENT_PAID = 'PAYMENT_PAID',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  USER_REGISTERED = 'USER_REGISTERED',
  USER_APPROVED = 'USER_APPROVED',
  USER_REJECTED = 'USER_REJECTED',
}

export enum NotificationType {
  BID_RECEIVED = 'BID_RECEIVED',
  BID_ACCEPTED = 'BID_ACCEPTED',
  BID_REJECTED = 'BID_REJECTED',
  BID_CANCELLED = 'BID_CANCELLED',
  BID_MODIFIED = 'BID_MODIFIED',
  LOT_CREATED = 'LOT_CREATED',
  LOT_SOLD = 'LOT_SOLD',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_PAID = 'PAYMENT_PAID',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',
  SYSTEM = 'SYSTEM',
}

export interface GeoPoint {
  type: 'Point';
  /**
   * Coordinates in [longitude, latitude] order as required by GeoJSON and MongoDB 2dsphere indexes
   */
  coordinates: [number, number];
}

export interface ProfilePhotoDTO {
  fileId?: string;
  url: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string;
}

export interface UserDTO {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  verificationStatus?: VerificationStatus;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
  profilePhoto?: ProfilePhotoDTO;
  location?: string;
  geoPoint?: GeoPoint;
  district?: string;
  state?: string;
  village?: string;
  primaryCrop?: string;
  farmSize?: number;
  preferredLanguage?: string;
  organization?: string;
  contactPerson?: string;
  businessType?: string;
  warehouseLocation?: string;
  gstin?: string;
  fssai?: string;
  kccNumber?: string;
  apmcLicense?: string;
  isVerified: boolean;
  profileCompletionStatus?: 'INCOMPLETE' | 'COMPLETE';
  profileCompletionPercentage?: number;
  missingFields?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CropDTO {
  id: string;
  name: string;
  category: string;
  defaultUnit: CropUnit;
}

export interface MarketDTO {
  id: string;
  name: string;
  district: string;
  state: string;
  location?: GeoPoint;
  latitude?: number;
  longitude?: number;
}

export interface MandiPriceDTO {
  id: string;
  cropId: string;
  marketId: string;
  cropName?: string;
  marketName?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalQuantity: number;
  date: string;
  source: 'AGMARKNET' | 'MOCK';
}

export interface CropLotDTO {
  id: string;
  farmerId: string;
  cropId: string;
  cropName?: string;
  quantity: number;
  unit: CropUnit | string;
  expectedPrice: number;
  qualityGrade: QualityGrade | string;
  location: string;
  geoPoint?: GeoPoint;
  harvestDate?: string;
  status: CropLotStatus;
  farmerName?: string;
  farmerVerified?: boolean;
  farmerPhoto?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BidDTO {
  id: string;
  lotId: string;
  buyerId: string;
  buyerName?: string;
  buyerPhoto?: string;
  price: number;
  quantity: number;
  message?: string;
  status: BidStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionDTO {
  id: string;
  lotId: string;
  buyerId: string;
  farmerId: string;
  acceptedBidId: string;
  agreedPrice: number;
  quantity: number;
  totalAmount: number;
  status: TransactionStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentDTO {
  id: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  paymentReference?: string;
  updatedAt: string;
}

export interface NotificationDTO {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogDTO {
  id: string;
  bidId?: string;
  lotId?: string;
  actorId: string;
  actorName?: string;
  actorRole?: string;
  action: AuditAction | string;
  oldQuantity?: number;
  newQuantity?: number;
  oldStatus?: string;
  newStatus?: string;
  price?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalFarmers: number;
  totalBuyers: number;
  activeLots: number;
  activeBiddingLots: number;
  soldLots: number;
  cancelledLots: number;
  pendingBids: number;
  acceptedBids: number;
  cancelledBids: number;
  modifiedBids: number;
  totalTransactionValue: number;
  pendingPaymentsValue: number;
  completedPaymentsValue: number;
  recentActivity: AuditLogDTO[];
}
