import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { WorkspaceMember } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePageDto, UpdatePageDto } from './page.dto.js';

const createdBy = { select: { id: true, name: true } };

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, workspaceId: string) {
    await this.requireMember(workspaceId, userId);
    return this.prisma.page.findMany({
      where: { workspaceId, deletedAt: null },
      include: { createdBy },
      orderBy: { createdAt: 'asc' },
    });
  }

  async get(userId: string, pageId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      include: { createdBy, parent: { select: { id: true, title: true } } },
    });
    if (!page || page.deletedAt) {
      throw new NotFoundException('صفحه پیدا نشد');
    }

    await this.requireMember(page.workspaceId, userId);
    return this.prisma.page.findUnique({
      where: { id: pageId },
      include: {
        createdBy,
        parent: { select: { id: true, title: true } },
        children: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async create(userId: string, dto: CreatePageDto) {
    await this.requireMember(dto.workspaceId, userId);
    if (dto.parentId) {
      await this.assertValidParent('new', dto.workspaceId, dto.parentId);
    }

    return this.prisma.page.create({
      data: {
        title: dto.title,
        description: dto.description,
        mode: dto.mode,
        workspaceId: dto.workspaceId,
        createdById: userId,
        parentId: dto.parentId,
      },
      include: { createdBy },
    });
  }

  async update(userId: string, pageId: string, dto: UpdatePageDto) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.deletedAt) {
      throw new NotFoundException('صفحه پیدا نشد');
    }

    const { membership } = await this.requireMember(page.workspaceId, userId);
    this.assertCanManage(membership, page.createdById, userId);

    if (dto.parentId !== undefined && dto.parentId !== null) {
      await this.assertValidParent(pageId, page.workspaceId, dto.parentId);
    }

    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        title: dto.title,
        description: dto.description,
        mode: dto.mode,
        parentId: dto.parentId,
      },
      include: { createdBy, children: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } } },
    });
  }

  async softDelete(userId: string, pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page || page.deletedAt) {
      throw new NotFoundException('صفحه پیدا نشد');
    }

    const { membership } = await this.requireMember(page.workspaceId, userId);
    this.assertCanManage(membership, page.createdById, userId);

    return this.prisma.page.update({
      where: { id: pageId },
      data: { deletedAt: new Date() },
      include: { createdBy },
    });
  }

  /** Loads the workspace and the user's membership, failing with 404/403. */
  private async requireMember(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { workspaceMembers: { where: { userId } } },
    });
    if (!workspace) {
      throw new NotFoundException('ورک‌اسپیس پیدا نشد');
    }

    const membership = workspace.workspaceMembers[0];
    if (!membership) {
      throw new ForbiddenException('شما عضو این ورک‌اسپیس نیستید');
    }
    return { workspace, membership };
  }

  private assertCanManage(membership: WorkspaceMember, createdById: string, userId: string): void {
    const canManage =
      membership.role === 'OWNER' || membership.role === 'ADMIN' || createdById === userId;
    if (!canManage) {
      throw new ForbiddenException('اجازه‌ی این کار را ندارید');
    }
  }

  /** The parent must live in the same workspace, be alive, and not be the page or one of its descendants. */
  private async assertValidParent(pageId: string, workspaceId: string, parentId: string) {
    if (parentId === pageId) {
      throw new BadRequestException('نمی‌توان صفحه را زیر خودش قرار داد');
    }

    const parent = await this.prisma.page.findFirst({
      where: { id: parentId, workspaceId, deletedAt: null },
      select: { parentId: true },
    });
    if (!parent) {
      throw new BadRequestException('صفحه‌ی والد در این ورک‌اسپیس پیدا نشد');
    }

    let ancestorId = parent.parentId;
    for (let depth = 0; ancestorId && depth < 100; depth++) {
      if (ancestorId === pageId) {
        throw new BadRequestException('نمی‌توان صفحه را زیر زیرمجموعه‌ی خودش قرار داد');
      }
      const ancestor = await this.prisma.page.findUnique({
        where: { id: ancestorId },
        select: { parentId: true },
      });
      ancestorId = ancestor?.parentId ?? null;
    }
  }
}
