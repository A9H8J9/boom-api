import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SafeUser } from '../auth/authentication.types.js';
import { User } from '../auth/user.decorator.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { PageService } from './page.service.js';
import { CreatePageDto, ListPagesQueryDto, UpdatePageDto } from './page.dto.js';

@ApiTags('pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  list(@User() user: SafeUser, @Query() query: ListPagesQueryDto) {
    return this.pageService.list(user.id, query.workspaceId);
  }

  @Get(':id')
  get(@User() user: SafeUser, @Param('id') pageId: string) {
    return this.pageService.get(user.id, pageId);
  }

  @Post()
  create(@User() user: SafeUser, @Body() dto: CreatePageDto) {
    return this.pageService.create(user.id, dto);
  }

  @Patch(':id')
  update(@User() user: SafeUser, @Param('id') pageId: string, @Body() dto: UpdatePageDto) {
    return this.pageService.update(user.id, pageId, dto);
  }

  @Delete(':id')
  softDelete(@User() user: SafeUser, @Param('id') pageId: string) {
    return this.pageService.softDelete(user.id, pageId);
  }
}
