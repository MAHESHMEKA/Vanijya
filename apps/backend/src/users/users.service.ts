import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FALLBACK_USERS } from '../auth/auth.service';

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
      missingFields: ['name', 'contact', 'district', 'state', 'location'],
    };
  }

  const role = user.role || 'FARMER';
  const missing: string[] = [];

  // Common identity checks
  if (!user.name || user.name.trim() === '') missing.push('name');
  if ((!user.phone || user.phone.trim() === '') && (!user.email || user.email.trim() === '')) {
    missing.push('contact');
  }

  let totalRequired = 5;

  if (role === 'FARMER') {
    if (!user.district || user.district.trim() === '') missing.push('district');
    if (!user.state || user.state.trim() === '') missing.push('state');
    if (!user.location || user.location.trim() === '') missing.push('location');
    totalRequired = 5;
  } else if (role === 'BUYER') {
    if (!user.district || user.district.trim() === '') missing.push('district');
    if (!user.state || user.state.trim() === '') missing.push('state');
    if (!user.location || user.location.trim() === '') missing.push('location');
    if (!user.organization || user.organization.trim() === '') missing.push('organization');
    totalRequired = 6;
  } else {
    // ADMIN
    totalRequired = 2;
  }

  const completedCount = Math.max(0, totalRequired - missing.length);
  const percentage = Math.round((completedCount / totalRequired) * 100);

  return {
    profileCompletionPercentage: percentage,
    profileCompletionStatus: missing.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
    missingFields: missing,
  };
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    if (!this.prisma.isConnected) {
      const fallback = FALLBACK_USERS.find((u) => u.id === userId);
      if (!fallback) throw new NotFoundException('User not found.');
      const completion = computeProfileCompletion(fallback);
      const { password, ...safeUser } = fallback;
      return {
        ...safeUser,
        ...completion,
      };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          verificationStatus: true,
          approvalStatus: true,
          rejectionReason: true,
          district: true,
          state: true,
          village: true,
          location: true,
          primaryCrop: true,
          farmSize: true,
          preferredLanguage: true,
          organization: true,
          contactPerson: true,
          businessType: true,
          warehouseLocation: true,
          gstin: true,
          fssai: true,
          kccNumber: true,
          apmcLicense: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (user) {
        const completion = computeProfileCompletion(user);
        return {
          ...user,
          ...completion,
        };
      }
    } catch (err) {
      // Fall through to in-memory check
    }

    const fallback = FALLBACK_USERS.find((u) => u.id === userId);
    if (fallback) {
      const completion = computeProfileCompletion(fallback);
      const { password, ...safeUser } = fallback;
      return { ...safeUser, ...completion };
    }
    throw new NotFoundException('User not found.');
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    if (!this.prisma.isConnected) {
      const fallback = FALLBACK_USERS.find((u) => u.id === userId);
      if (fallback) {
        Object.assign(fallback, dto);
        const completion = computeProfileCompletion(fallback);
        const { password, ...safeUser } = fallback;
        return { ...safeUser, ...completion };
      }
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          verificationStatus: true,
          approvalStatus: true,
          rejectionReason: true,
          district: true,
          state: true,
          village: true,
          location: true,
          primaryCrop: true,
          farmSize: true,
          preferredLanguage: true,
          organization: true,
          contactPerson: true,
          businessType: true,
          warehouseLocation: true,
          gstin: true,
          fssai: true,
          kccNumber: true,
          apmcLicense: true,
          isVerified: true,
          updatedAt: true,
        },
      });

      const completion = computeProfileCompletion(updated);
      return {
        ...updated,
        ...completion,
      };
    } catch (err) {
      const fallback = FALLBACK_USERS.find((u) => u.id === userId);
      if (fallback) {
        Object.assign(fallback, dto);
        const completion = computeProfileCompletion(fallback);
        const { password, ...safeUser } = fallback;
        return { ...safeUser, ...completion };
      }
      throw err;
    }
  }
}
