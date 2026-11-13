import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.inbox.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async readAll(userId: string) {
    const { count } = await this.prisma.inbox.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { count };
  }
}
