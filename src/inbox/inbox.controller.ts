import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SafeUser } from '../auth/authentication.types.js';
import { User } from '../auth/user.decorator.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { InboxService } from './inbox.service.js';

@ApiTags('inbox')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get()
  list(@User() user: SafeUser) {
    return this.inboxService.list(user.id);
  }

  @Patch('read-all')
  readAll(@User() user: SafeUser) {
    return this.inboxService.readAll(user.id);
  }
}
