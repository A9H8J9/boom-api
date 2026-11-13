import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SafeUser } from '../auth/authentication.types.js';
import { User } from '../auth/user.decorator.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { UserService } from './user.service.js';
import { UpdateNotificationSettingsDto, UpdateUserSettingsDto } from './user.dto.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@User() user: SafeUser) {
    return user;
  }

  @Get('settings')
  getSettings(@User() user: SafeUser) {
    return this.userService.getSettings(user.id);
  }

  @Patch('settings')
  updateSettings(@User() user: SafeUser, @Body() dto: UpdateUserSettingsDto) {
    return this.userService.updateSettings(user.id, dto);
  }

  @Get('notification-settings')
  getNotificationSettings(@User() user: SafeUser) {
    return this.userService.getNotificationSettings(user.id);
  }

  @Patch('notification-settings')
  updateNotificationSettings(@User() user: SafeUser, @Body() dto: UpdateNotificationSettingsDto) {
    return this.userService.updateNotificationSettings(user.id, dto);
  }
}
