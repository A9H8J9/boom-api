import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { randomSuffix, slugify } from '../common/slug.js';
import type {
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  UpdateMemberRoleDto,
  UpdatePermissionsDto,
} from './workspace.dto.js';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    try {
      return await this.prisma.workspace.create({
        data: {
          name: dto.name,
          icon: dto.icon,
          slug: await this.uniqueSlug(dto.name),
          ownerId: userId,
          workspaceMembers: { create: { userId, role: 'OWNER' } },
        },
        include: { workspaceMembers: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('خطا در ساخت ورک‌اسپیس، دوباره تلاش کنید');
      }
      throw error;
    }
  }

  async updatePermissions(userId: string, workspaceId: string, dto: UpdatePermissionsDto) {
    if (
      dto.allowPublicLinks === undefined &&
      dto.allowMemberExport === undefined &&
      dto.allowMemberInvites === undefined
    ) {
      throw new BadRequestException('حداقل یک فیلد دسترسی باید ارسال شود');
    }

    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      throw new NotFoundException('ورک‌اسپیس پیدا نشد');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new ForbiddenException('فقط مالک یا مدیر می‌تواند دسترسی‌ها را تغییر دهد');
    }

    return this.prisma.workspace.update({ where: { id: workspaceId }, data: dto });
  }

  async listMembers(userId: string, workspaceId: string) {
    await this.requireMember(workspaceId, userId);
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });
  }

  async addMember(userId: string, workspaceId: string, dto: AddWorkspaceMemberDto) {
    const membership = await this.requireMember(workspaceId, userId);
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException('فقط مالک یا مدیر می‌تواند عضو اضافه کند');
    }

    const target = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!target) {
      throw new NotFoundException('کاربری با این ایمیل پیدا نشد');
    }

    const role = dto.role ?? 'MEMBER';
    if (role === 'ADMIN' && membership.role !== 'OWNER') {
      throw new ForbiddenException('فقط مالک می‌تواند مدیر اضافه کند');
    }

    try {
      return await this.prisma.workspaceMember.create({
        data: { workspaceId, userId: target.id, role },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('این کاربر قبلاً عضو این ورک‌اسپیس شده است');
      }
      throw error;
    }
  }

  async updateMemberRole(userId: string, workspaceId: string, targetUserId: string, dto: UpdateMemberRoleDto) {
    const membership = await this.requireMember(workspaceId, userId);
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException('فقط مالک یا مدیر می‌تواند نقش‌ها را تغییر دهد');
    }

    const target = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!target) {
      throw new NotFoundException('عضو پیدا نشد');
    }
    if (target.role === 'OWNER') {
      throw new ForbiddenException('نقش مالک قابل تغییر نیست');
    }
    if (dto.role === 'ADMIN' && membership.role !== 'OWNER') {
      throw new ForbiddenException('فقط مالک می‌تواند مدیر کند');
    }

    return this.prisma.workspaceMember.update({
      where: { id: target.id },
      data: { role: dto.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeMember(userId: string, workspaceId: string, targetUserId: string) {
    const membership = await this.requireMember(workspaceId, userId);
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException('فقط مالک یا مدیر می‌تواند عضو حذف کند');
    }

    const target = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!target) {
      throw new NotFoundException('عضو پیدا نشد');
    }
    if (target.role === 'OWNER') {
      throw new ForbiddenException('مالک ورک‌اسپیس قابل حذف نیست');
    }

    return this.prisma.workspaceMember.delete({
      where: { id: target.id },
      include: { user: { select: { id: true, name: true, email: true } } },
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
    return membership;
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'workspace';
    let slug = base;
    for (let i = 0; i < 5; i++) {
      const taken = await this.prisma.workspace.findUnique({ where: { slug } });
      if (!taken) {
        return slug;
      }
      slug = `${base}-${randomSuffix()}`;
    }
    return slug;
  }
}
