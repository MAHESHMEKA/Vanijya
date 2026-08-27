import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { FALLBACK_USERS } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'vanijya_super_secret_jwt_key_sih2024',
    });
  }

  async validate(payload: { sub: string; role: string }) {
    if (!this.prisma.isConnected) {
      const fallbackUser = FALLBACK_USERS.find((u) => u.id === payload.sub);
      if (fallbackUser) {
        const { password, ...safeUser } = fallbackUser;
        return safeUser;
      }
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          district: true,
          state: true,
          location: true,
          isVerified: true,
        },
      });

      if (user) return user;
    } catch (err) {
      const fallbackUser = FALLBACK_USERS.find((u) => u.id === payload.sub);
      if (fallbackUser) {
        const { password, ...safeUser } = fallbackUser;
        return safeUser;
      }
    }

    throw new UnauthorizedException('User not found or session expired');
  }
}
