import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Role, VerificationStatus, ApprovalStatus } from '../database/schemas';
import { UpdateUserDto } from './dto/update-user.dto';

export interface ProfileCompletionResult {
  profileCompletionPercentage: number;
  profileCompletionStatus: 'COMPLETE' | 'INCOMPLETE';
  missingFields: string[];
}

export function computeProfileCompletion(user: any): ProfileCompletionResult {
  if (!user) {
    return {
      profileCompletionPercentage: 0,
      profileCompletionStatus: 'INCOMPLETE',
      missingFields: ['name', 'contact', 'district', 'state', 'location', 'profilePhoto'],
    };
  }

  const role = user.role || Role.FARMER;
  const missing: string[] = [];

  // Common identity checks
  if (!user.name || user.name.trim() === '') missing.push('name');
  if ((!user.phone || user.phone.trim() === '') && (!user.email || user.email.trim() === '')) {
    missing.push('contact');
  }

  // Profile Photo Check
  const hasPhoto = user.profilePhoto && (user.profilePhoto.url || user.profilePhoto.fileId);
  if (!hasPhoto) missing.push('profilePhoto');

  let totalRequired = 6;

  if (role === Role.FARMER) {
    if (!user.district || user.district.trim() === '') missing.push('district');
    if (!user.state || user.state.trim() === '') missing.push('state');
    if (!user.location || user.location.trim() === '') missing.push('location');
    totalRequired = 6;
  } else if (role === Role.BUYER) {
    if (!user.district || user.district.trim() === '') missing.push('district');
    if (!user.state || user.state.trim() === '') missing.push('state');
    if (!user.location || user.location.trim() === '') missing.push('location');
    if (!user.organization || user.organization.trim() === '') missing.push('organization');
    totalRequired = 7;
  } else {
    // ADMIN
    totalRequired = 3;
  }

  const completedCount = Math.max(0, totalRequired - missing.length);
  const percentage = Math.round((completedCount / totalRequired) * 100);

  return {
    profileCompletionPercentage: percentage,
    profileCompletionStatus: missing.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
    missingFields: missing,
  };
}

export const FALLBACK_USERS: any[] = [
  {
    _id: 'usr-farmer-1',
    id: 'usr-farmer-1',
    name: 'Ramesh Patel',
    phone: '9876543210',
    email: 'ramesh.patel@farmer.in',
    passwordHash: '$2b$10$wK1yR1.vG6xV5V1eZ0bBReO8.O4Z.v.V1eZ0bBReO8.O4Z.v.V1e',
    role: Role.FARMER,
    verificationStatus: VerificationStatus.VERIFIED,
    approvalStatus: ApprovalStatus.APPROVED,
    rejectionReason: null,
    approvedBy: 'usr-admin-1',
    approvedAt: new Date(),
    profilePhoto: {
      url: '/images/avatars/farmer-ramesh.svg',
      mimeType: 'image/svg+xml',
      size: 1024,
      uploadedAt: new Date(),
    },
    location: 'Village Pimpalgaon, Niphad Taluka, Nashik',
    geoPoint: { type: 'Point', coordinates: [73.9854, 20.1718] },
    district: 'Nashik',
    state: 'Maharashtra',
    village: 'Pimpalgaon Baswant',
    primaryCrop: 'Tomato',
    farmSize: 5.5,
    preferredLanguage: 'hi',
    kccNumber: 'KCC-MH-NSK-8821',
    apmcLicense: 'APMC-NSK-FMR-1042',
    isVerified: true,
  },
  {
    _id: 'usr-farmer-2',
    id: 'usr-farmer-2',
    name: 'Gurpreet Singh',
    phone: '9876543211',
    email: 'gurpreet.singh@farmer.in',
    passwordHash: '$2b$10$wK1yR1.vG6xV5V1eZ0bBReO8.O4Z.v.V1eZ0bBReO8.O4Z.v.V1e',
    role: Role.FARMER,
    verificationStatus: VerificationStatus.VERIFIED,
    approvalStatus: ApprovalStatus.APPROVED,
    rejectionReason: null,
    approvedBy: 'usr-admin-1',
    approvedAt: new Date(),
    profilePhoto: {
      url: '/images/avatars/farmer-gurpreet.svg',
      mimeType: 'image/svg+xml',
      size: 1024,
      uploadedAt: new Date(),
    },
    location: 'VPO Khanna, Ludhiana District',
    geoPoint: { type: 'Point', coordinates: [76.2167, 30.7046] },
    district: 'Ludhiana',
    state: 'Punjab',
    village: 'Khanna',
    primaryCrop: 'Wheat',
    farmSize: 12.0,
    preferredLanguage: 'en',
    kccNumber: 'KCC-PB-LDH-4412',
    apmcLicense: 'APMC-LDH-FMR-0981',
    isVerified: true,
  },
  {
    _id: 'usr-buyer-1',
    id: 'usr-buyer-1',
    name: 'FreshCart Agro Ltd. (Praveen Kumar)',
    phone: '9876543212',
    email: 'buyer@freshcart.com',
    passwordHash: '$2b$10$wK1yR1.vG6xV5V1eZ0bBReO8.O4Z.v.V1eZ0bBReO8.O4Z.v.V1e',
    role: Role.BUYER,
    verificationStatus: VerificationStatus.VERIFIED,
    approvalStatus: ApprovalStatus.APPROVED,
    rejectionReason: null,
    approvedBy: 'usr-admin-1',
    approvedAt: new Date(),
    profilePhoto: {
      url: '/images/avatars/buyer-freshcart.svg',
      mimeType: 'image/svg+xml',
      size: 1024,
      uploadedAt: new Date(),
    },
    location: 'Vashi APMC Complex, Navi Mumbai',
    geoPoint: { type: 'Point', coordinates: [73.0033, 19.076] },
    district: 'Mumbai',
    state: 'Maharashtra',
    organization: 'FreshCart Agro Limited',
    contactPerson: 'Praveen Kumar',
    businessType: 'Wholesale Food Processor',
    warehouseLocation: 'Vashi APMC Sector 19, Navi Mumbai',
    gstin: '27AABCU9603R1ZM',
    fssai: '10019022009876',
    apmcLicense: 'APMC-VSH-BYR-550',
    isVerified: true,
  },
  {
    _id: 'usr-buyer-2',
    id: 'usr-buyer-2',
    name: 'GreenSpire Foods Pvt Ltd (Ananya Sharma)',
    phone: '9876543213',
    email: 'procurement@greenspire.in',
    passwordHash: '$2b$10$wK1yR1.vG6xV5V1eZ0bBReO8.O4Z.v.V1eZ0bBReO8.O4Z.v.V1e',
    role: Role.BUYER,
    verificationStatus: VerificationStatus.VERIFIED,
    approvalStatus: ApprovalStatus.APPROVED,
    rejectionReason: null,
    approvedBy: 'usr-admin-1',
    approvedAt: new Date(),
    profilePhoto: {
      url: '/images/avatars/buyer-greenspire.svg',
      mimeType: 'image/svg+xml',
      size: 1024,
      uploadedAt: new Date(),
    },
    location: 'Bawana Industrial Area, Sector 2, Delhi',
    geoPoint: { type: 'Point', coordinates: [77.0505, 28.7952] },
    district: 'North Delhi',
    state: 'Delhi',
    organization: 'GreenSpire Foods Private Limited',
    contactPerson: 'Ananya Sharma',
    businessType: 'Institutional Supply & Retail Chain',
    warehouseLocation: 'Azadpur Terminal Yard C, Delhi',
    gstin: '07AAECG4412Q1Z8',
    fssai: '10021011003421',
    apmcLicense: 'APMC-AZD-BYR-112',
    isVerified: true,
  },
  {
    _id: 'usr-admin-1',
    id: 'usr-admin-1',
    name: 'Vanijya System Admin',
    phone: '9876543214',
    email: 'admin@vanijya.gov.in',
    passwordHash: '$2b$10$wK1yR1.vG6xV5V1eZ0bBReO8.O4Z.v.V1eZ0bBReO8.O4Z.v.V1e',
    role: Role.ADMIN,
    verificationStatus: VerificationStatus.VERIFIED,
    approvalStatus: ApprovalStatus.APPROVED,
    rejectionReason: null,
    approvedBy: 'SYSTEM',
    approvedAt: new Date(),
    profilePhoto: {
      url: '/images/avatars/admin-system.svg',
      mimeType: 'image/svg+xml',
      size: 1024,
      uploadedAt: new Date(),
    },
    location: 'Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    organization: 'Ministry of Agriculture & Farmers Welfare',
    isVerified: true,
  },
];

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getProfile(userId: string) {
    try {
      const user = await this.userModel.findById(userId).lean();
      if (user) {
        const safeUser = this.sanitizeUser(user);
        const completion = computeProfileCompletion(safeUser);
        return { ...safeUser, ...completion };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB getProfile lookup failed for ${userId}: ${err.message}`);
    }

    const fallback = FALLBACK_USERS.find((u) => u.id === userId || u._id === userId);
    if (fallback) {
      const safeUser = this.sanitizeUser(fallback);
      const completion = computeProfileCompletion(safeUser);
      return { ...safeUser, ...completion };
    }

    throw new NotFoundException('User not found.');
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    try {
      const updated = await this.userModel
        .findByIdAndUpdate(userId, { $set: dto }, { new: true })
        .lean();
      if (updated) {
        const safeUser = this.sanitizeUser(updated);
        const completion = computeProfileCompletion(safeUser);
        return { ...safeUser, ...completion };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB updateProfile failed for ${userId}: ${err.message}`);
    }

    const fallback = FALLBACK_USERS.find((u) => u.id === userId || u._id === userId);
    if (fallback) {
      Object.assign(fallback, dto);
      const safeUser = this.sanitizeUser(fallback);
      const completion = computeProfileCompletion(safeUser);
      return { ...safeUser, ...completion };
    }

    throw new NotFoundException('User not found.');
  }

  async updateProfilePhoto(
    userId: string,
    photoData: { fileId: string; url: string; mimeType: string; size: number; uploadedAt: Date },
  ) {
    try {
      const updated = await this.userModel
        .findByIdAndUpdate(userId, { $set: { profilePhoto: photoData } }, { new: true })
        .lean();
      if (updated) {
        return this.sanitizeUser(updated);
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB updateProfilePhoto failed for ${userId}: ${err.message}`);
    }

    const fallback = FALLBACK_USERS.find((u) => u.id === userId || u._id === userId);
    if (fallback) {
      fallback.profilePhoto = photoData;
      return this.sanitizeUser(fallback);
    }

    throw new NotFoundException('User not found.');
  }

  private sanitizeUser(user: any) {
    const { password, passwordHash, ...safe } = user;
    return {
      ...safe,
      id: user._id || user.id,
    };
  }
}
