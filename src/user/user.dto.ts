import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NewPageTitleMode, StartPage } from '../../generated/prisma/client.js';

export class UpdateUserSettingsDto {
  @ApiPropertyOptional({ example: 'fa', maxLength: 10, description: 'زبان رابط کاربری' })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  language?: string;

  @ApiPropertyOptional({ enum: ['DASHBOARD', 'LAST_VISITED', 'AI', 'PROJECT', 'ALL_BOOM'], example: 'DASHBOARD', description: 'صفحه‌ی شروع' })
  @IsOptional()
  @IsEnum(StartPage)
  startPage?: StartPage;

  @ApiPropertyOptional({ example: 'Asia/Tehran', maxLength: 64, description: 'منطقه‌ی زمانی' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  timezone?: string;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'تشخیص خودکار منطقه‌ی زمانی' })
  @IsOptional()
  @IsBoolean()
  autoDetectTimezone?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: false, description: 'جمع‌شدن سایدبار' })
  @IsOptional()
  @IsBoolean()
  sidebarCollapsed?: boolean;

  @ApiPropertyOptional({ enum: ['UNTITLED', 'DATE'], example: 'DATE', description: 'حالت نام‌گذاری صفحه‌ی جدید' })
  @IsOptional()
  @IsEnum(NewPageTitleMode)
  newPageTitleMode?: NewPageTitleMode;
}

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ type: Boolean, example: false, description: 'اعلان دسکتاپ (پیش‌فرض: false)' })
  @IsOptional()
  @IsBoolean()
  desktopEnabled?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'اعلان داخل برنامه (پیش‌فرض: true)' })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'اعلان ایمیلی (پیش‌فرض: true)' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: false, description: 'صدای اعلان (پیش‌فرض: false)' })
  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'اعلان منشن‌ها (پیش‌فرض: true)' })
  @IsOptional()
  @IsBoolean()
  mentionEnabled?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'اعلان کامنت‌ها (پیش‌فرض: true)' })
  @IsOptional()
  @IsBoolean()
  commentEnabled?: boolean;
}
