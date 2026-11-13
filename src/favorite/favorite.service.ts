import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ToggleFavoriteDto } from './favorite.dto.js';

const pageInclude = {
  page: {
    include: { createdBy: { select: { id: true, name: true } } },
  },
} satisfies Prisma.FavoriteInclude;

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId, page: { deletedAt: null } },
      include: pageInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Adds the page to the user's favorites, or removes it if it is already there. */
  async toggle(userId: string, dto: ToggleFavoriteDto) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_pageId: { userId, pageId: dto.pageId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { added: false };
    }

    const page = await this.prisma.page.findFirst({
      where: { id: dto.pageId, deletedAt: null },
      select: { id: true, workspaceId: true },
    });
    if (!page) {
      throw new NotFoundException('صفحه پیدا نشد');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: page.workspaceId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('شما عضو ورک‌اسپیس این صفحه نیستید');
    }

    try {
      const favorite = await this.prisma.favorite.create({
        data: { userId, pageId: page.id },
        include: pageInclude,
      });
      return { added: true, favorite };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('خطا در ثبت علاقه‌مندی، دوباره تلاش کنید');
      }
      throw error;
    }
  }
}
