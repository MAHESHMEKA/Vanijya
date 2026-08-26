/**
 * Vanijya Shared Types & Domain Enums
 * Smart India Hackathon (SIH) Problem Statement 26132
 */

export enum UserRole {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN',
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

export interface UserDTO {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  location?: string;
  district?: string;
  state?: string;
  isVerified: boolean;
  createdAt: string;
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
  harvestDate: string;
  status: CropLotStatus;
  farmerName?: string;
  farmerVerified?: boolean;
  createdAt: string;
}

export interface BidDTO {
  id: string;
  lotId: string;
  buyerId: string;
  buyerName?: string;
  price: number;
  quantity: number;
  message?: string;
  status: BidStatus;
  createdAt: string;
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
}

export interface PaymentDTO {
  id: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  reference?: string;
  updatedAt: string;
}
