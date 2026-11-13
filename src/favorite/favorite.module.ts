import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FavoriteController } from './favorite.controller.js';
import { FavoriteService } from './favorite.service.js';

@Module({
  imports: [AuthModule],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
