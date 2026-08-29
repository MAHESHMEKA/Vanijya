import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { FALLBACK_USERS } from '../fallback-users';
import { AuthService } from '../auth.service';
import { computeProfileCompletion } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'vanijya_super_secret_jwt_key_sih2024',
    });
  }

  async validate(payload: { sub: string; role: string }) {
    if (this.prisma.isConnected) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
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
          },
        });

        if (user) {
          const completion = computeProfileCompletion(user);
          return { ...user, ...completion };
        }
      } catch (err) {
        // Fall through to in-memory check
      }
    }

    const registered = this.authService ? this.authService.getInMemoryRegisteredUsers() : [];
    const allUsers = [...FALLBACK_USERS, ...registered];
    const fallbackUser = allUsers.find((u) => u.id === payload.sub);
    if (fallbackUser) {
      const { password, ...safeUser } = fallbackUser;
      const completion = computeProfileCompletion(fallbackUser);
      return { ...safeUser, ...completion };
    }

    throw new UnauthorizedException('User not found or session expired');
  }
}
