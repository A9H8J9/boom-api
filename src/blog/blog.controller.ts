import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service.js';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  list() {
    return this.blogService.list();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.blogService.getBySlug(slug);
  }
}
