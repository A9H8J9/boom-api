import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SafeUser } from '../auth/authentication.types.js';
import { User } from '../auth/user.decorator.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { ProjectService } from './project.service.js';
import { ListProjectsQueryDto, RenameProjectDto } from './project.dto.js';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  list(@User() user: SafeUser, @Query() query: ListProjectsQueryDto) {
    return this.projectService.list(user.id, query.workspaceId);
  }

  @Patch(':id')
  rename(@User() user: SafeUser, @Param('id') projectId: string, @Body() dto: RenameProjectDto) {
    return this.projectService.rename(user.id, projectId, dto);
  }

  @Delete(':id')
  remove(@User() user: SafeUser, @Param('id') projectId: string) {
    return this.projectService.softDelete(user.id, projectId);
  }
}
