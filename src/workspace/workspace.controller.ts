import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SafeUser } from '../auth/authentication.types.js';
import { User } from '../auth/user.decorator.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { WorkspaceService } from './workspace.service.js';
import {
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  UpdateMemberRoleDto,
  UpdatePermissionsDto,
} from './workspace.dto.js';

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  list(@User() user: SafeUser) {
    return this.workspaceService.list(user.id);
  }

  @Post()
  create(@User() user: SafeUser, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.create(user.id, dto);
  }

  @Patch(':workspace_id/permissions')
  updatePermissions(
    @User() user: SafeUser,
    @Param('workspace_id') workspaceId: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.workspaceService.updatePermissions(user.id, workspaceId, dto);
  }

  @Get(':workspace_id/members')
  listMembers(@User() user: SafeUser, @Param('workspace_id') workspaceId: string) {
    return this.workspaceService.listMembers(user.id, workspaceId);
  }

  @Post(':workspace_id/members')
  addMember(
    @User() user: SafeUser,
    @Param('workspace_id') workspaceId: string,
    @Body() dto: AddWorkspaceMemberDto,
  ) {
    return this.workspaceService.addMember(user.id, workspaceId, dto);
  }

  @Patch(':workspace_id/members/:user_id')
  updateMemberRole(
    @User() user: SafeUser,
    @Param('workspace_id') workspaceId: string,
    @Param('user_id') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaceService.updateMemberRole(user.id, workspaceId, targetUserId, dto);
  }

  @Delete(':workspace_id/members/:user_id')
  removeMember(
    @User() user: SafeUser,
    @Param('workspace_id') workspaceId: string,
    @Param('user_id') targetUserId: string,
  ) {
    return this.workspaceService.removeMember(user.id, workspaceId, targetUserId);
  }
}
