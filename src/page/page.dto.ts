import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageMode } from '../../generated/prisma/enums.js';

export class ListPagesQueryDto {
  @ApiProperty({ example: 'cmwavf50t00015ccxqyil8rmz', description: 'شناسه‌ی ورک‌اسپیس' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}

export class CreatePageDto {
  @ApiProperty({ example: 'cmwavf50t00015ccxqyil8rmz', description: 'ورک‌اسپیس مقصد' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiPropertyOptional({ example: 'صفحه‌ی من', maxLength: 200, description: 'عنوان صفحه (پیش‌فرض: بدون عنوان)' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @ApiPropertyOptional({ example: 'توضیح کوتاه صفحه', maxLength: 2000, description: 'توضیح صفحه' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: ['PAGE', 'EDGELESS'], example: 'PAGE', description: 'حالت صفحه' })
  @IsOptional()
  @IsEnum(PageMode)
  mode?: PageMode;

  @ApiPropertyOptional({ example: 'cmwavfme900008scx4j0sezqz', description: 'صفحه‌ی والد (برای سلسله‌مراتب)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  parentId?: string;
}

export class UpdatePageDto {
  @ApiPropertyOptional({ example: 'عنوان جدید', maxLength: 200, description: 'عنوان جدید صفحه' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @ApiPropertyOptional({ example: 'توضیح جدید', maxLength: 2000, description: 'توضیح جدید صفحه' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: ['PAGE', 'EDGELESS'], example: 'EDGELESS', description: 'حالت جدید صفحه' })
  @IsOptional()
  @IsEnum(PageMode)
  mode?: PageMode;

  @ApiPropertyOptional({ type: String, nullable: true, example: null, description: 'صفحه‌ی والد جدید؛ null یعنی انتقال به ریشه' })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}
