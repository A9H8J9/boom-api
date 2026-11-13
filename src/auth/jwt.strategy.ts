import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SafeUser } from './authentication.types.js';

/**
 * Verifies the bearer access tokens `TokenService` issues (HS256, the same
 * key, issuer and audience) and loads their user, password omitted.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
      issuer: 'boom-api',
      audience: 'boom-app',
    });
  }

  async validate(payload: { sub?: string }): Promise<SafeUser> {
    const user = payload.sub
      ? await this.prisma.user.findUnique({
          where: { id: payload.sub },
          omit: { password: true },
        })
      : null;
    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }
    return user;
  }
}
