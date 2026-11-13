import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { WorkspaceMember } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RenameProjectDto } from './project.dto.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, workspaceId: string) {
    await this.requireMember(workspaceId, userId);
    return this.prisma.project.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async rename(userId: string, projectId: string, dto: RenameProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) {
      throw new NotFoundException('پروژه پیدا نشد');
    }

    const { membership } = await this.requireMember(project.workspaceId, userId);
    this.assertCanManage(membership, project.createdById, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: { name: dto.name },
    });
  }

  async softDelete(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) {
      throw new NotFoundException('پروژه پیدا نشد');
    }

    const { membership } = await this.requireMember(project.workspaceId, userId);
    this.assertCanManage(membership, project.createdById, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
  }

  /** Loads the workspace and the user's membership in it, failing with 404/403. */
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
}
