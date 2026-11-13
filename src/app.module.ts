import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { PlanModule } from './plan/plan.module.js';
import { InboxModule } from './inbox/inbox.module.js';
import { WorkspaceModule } from './workspace/workspace.module.js';
import { ProjectModule } from './project/project.module.js';
import { PageModule } from './page/page.module.js';
import { TaskModule } from './task/task.module.js';
import { FavoriteModule } from './favorite/favorite.module.js';
import { BlogModule } from './blog/blog.module.js';
import { AiModule } from './ai/ai.module.js';
import { TemplateModule } from './template/template.module.js';

@Module({
  imports: [
    AuthenticationModule.forRootAsync({
      useFactory: () => ({
        accessToken: {
          key: process.env.JWT_SECRET!,
          issuer: 'boom-api',
          audience: 'boom-app',
          ttl: '15m',
        },
        refreshToken: false,
      }),
      globalGuard: false,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    PlanModule,
    InboxModule,
    WorkspaceModule,
    ProjectModule,
    PageModule,
    TaskModule,
    FavoriteModule,
    BlogModule,
    AiModule,
    TemplateModule,
  ],
})
export class AppModule {}
