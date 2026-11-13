import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'node:crypto';
import type { User } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SafeUser } from './authentication.types.js';
import type { GoogleAuthDto, LoginDto, RegisterDto } from './auth.dto.js';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; expiresIn: number; user: SafeUser }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const valid = await this.passwordHasher.verify(dto.password, user?.password);
    if (!user || !valid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }
    return this.issueTokens(user, 'password');
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string; expiresIn: number; user: SafeUser }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await this.passwordHasher.hash(dto.password),
      },
    });
    return this.issueTokens(user, 'password');
  }

  /** Logs the user in with a Google ID token, creating the account on first use. */
  async google(dto: GoogleAuthDto): Promise<{ accessToken: string; expiresIn: number; user: SafeUser }> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new ServiceUnavailableException('ورود با گوگل پیکربندی نشده است');
    }

    const payload = await this.verifyGoogleIdToken(dto.idToken, clientId);
    if (!payload?.email || payload.email_verified === false) {
      throw new UnauthorizedException('توکن گوگل معتبر نیست');
    }

    let user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: payload.name ?? payload.email.split('@')[0],
          email: payload.email,
          // Google users have no password of their own; an unguessable one keeps the column satisfied.
          password: await this.passwordHasher.hash(`${randomUUID()}${randomUUID()}`),
        },
      });
    }
    return this.issueTokens(user, 'google');
  }

  private async verifyGoogleIdToken(idToken: string, clientId: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience: clientId });
      return ticket.getPayload();
    } catch {
      throw new UnauthorizedException('توکن گوگل معتبر نیست');
    }
  }

  private async issueTokens(
    user: User,
    method: string,
  ): Promise<{ accessToken: string; expiresIn: number; user: SafeUser }> {
    const { accessToken, expiresIn } = await this.tokenService.issue(user.id, {
      method,
      claims: { amr: [method === 'google' ? 'sso' : 'pwd'] },
    });
    return { accessToken, expiresIn, user: this.toSafeUser(user) };
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
