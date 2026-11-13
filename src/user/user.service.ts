import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateNotificationSettingsDto, UpdateUserSettingsDto } from './user.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /** The user's settings, created with schema defaults on first access. */
  getSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updateSettings(userId: string, dto: UpdateUserSettingsDto) {
    const data = {
      language: dto.language,
      startPage: dto.startPage,
      timezone: dto.timezone,
      autoDetectTimezone: dto.autoDetectTimezone,
      sidebarCollapsed: dto.sidebarCollapsed,
      newPageTitleMode: dto.newPageTitleMode,
    };
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  /** The user's notification settings, created with schema defaults on first access. */
  getNotificationSettings(userId: string) {
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    const data = {
      desktopEnabled: dto.desktopEnabled,
      inAppEnabled: dto.inAppEnabled,
      emailEnabled: dto.emailEnabled,
      soundEnabled: dto.soundEnabled,
      mentionEnabled: dto.mentionEnabled,
      commentEnabled: dto.commentEnabled,
    };
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
