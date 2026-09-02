import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas';
import { AuthService, FALLBACK_USERS } from '../auth.service';
import { computeProfileCompletion } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'vanijya_super_secret_jwt_key_sih2024',
    });
  }

  async validate(payload: { sub: string; role: string }) {
    try {
      const user = (await this.userModel.findById(payload.sub).lean()) as any;
      if (user) {
        const { password, passwordHash, ...safeUser } = user;
        const completion = computeProfileCompletion(user);
        return {
          id: user._id || user.id,
          ...safeUser,
          ...completion,
        };
      }
    } catch (err: any) {
      // Fall through to in-memory fallback
    }

    const registered = this.authService ? this.authService.getInMemoryRegisteredUsers() : [];
    const allUsers = [...FALLBACK_USERS, ...registered];
    const fallbackUser = allUsers.find((u) => u.id === payload.sub || u._id === payload.sub);
    if (fallbackUser) {
      const { password, passwordHash, ...safeUser } = fallbackUser;
      const completion = computeProfileCompletion(fallbackUser);
      return {
        id: fallbackUser._id || fallbackUser.id,
        ...safeUser,
        ...completion,
      };
    }

    throw new UnauthorizedException('User not found or session expired');
  }
}
