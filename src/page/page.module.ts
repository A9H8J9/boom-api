import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PageController } from './page.controller.js';
import { PageService } from './page.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PageController],
  providers: [PageService],
})
export class PageModule {}
