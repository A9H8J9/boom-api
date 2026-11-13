import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleFavoriteDto {
  @ApiProperty({ example: 'cmwavfme900008scx4j0sezqz', description: 'شناسه‌ی صفحه‌ای که وضعیت علاقه‌مندی‌اش عوض می‌شود' })
  @IsString()
  @IsNotEmpty()
  pageId: string;
}
