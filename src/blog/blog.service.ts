import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BlogService {
  private static readonly include = {
    author: { select: { id: true, name: true } },
    tags: true,
  } satisfies Prisma.BlogInclude;

  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.blog.findMany({
      where: { publishedAt: { not: null } },
      include: BlogService.include,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: BlogService.include,
    });
    if (!blog || blog.publishedAt === null) {
      throw new NotFoundException('پست پیدا نشد');
    }
    return blog;
  }
}
