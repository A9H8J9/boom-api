import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SafeUser } from '../auth/authentication.types.js';
import { User } from '../auth/user.decorator.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { FavoriteService } from './favorite.service.js';
import { ToggleFavoriteDto } from './favorite.dto.js';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  list(@User() user: SafeUser) {
    return this.favoriteService.list(user.id);
  }

  /** Toggles: adds the page to favorites, or removes it if it is already there. */
  @Post()
  toggle(@User() user: SafeUser, @Body() dto: ToggleFavoriteDto) {
    return this.favoriteService.toggle(user.id, dto);
  }
}
