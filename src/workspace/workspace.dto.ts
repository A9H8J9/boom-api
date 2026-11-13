import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Roles a requester may grant; the OWNER role itself belongs to the workspace owner. */
const ASSIGNABLE_ROLES = ['ADMIN', 'MEMBER', 'GUEST'] as const;

export class AddWorkspaceMemberDto {
  @ApiProperty({ example: 'member@example.com', description: 'ایمیل کاربری که اضافه می‌شود' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: [...ASSIGNABLE_ROLES], example: 'MEMBER', description: 'نقش عضو جدید (پیش‌فرض: MEMBER)' })
  @IsOptional()
  @IsIn(ASSIGNABLE_ROLES)
  role?: (typeof ASSIGNABLE_ROLES)[number];
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: [...ASSIGNABLE_ROLES], example: 'ADMIN', description: 'نقش جدید عضو' })
  @IsIn(ASSIGNABLE_ROLES)
  role: (typeof ASSIGNABLE_ROLES)[number];
}

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'My Workspace', minLength: 1, maxLength: 100, description: 'نام ورک‌اسپیس' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ example: '🚀', maxLength: 255, description: 'آیکون ورک‌اسپیس' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  icon?: string;
}

export class UpdatePermissionsDto {
  @ApiPropertyOptional({ type: Boolean, example: true, description: 'اجازه‌ی لینک‌های عمومی' })
  @IsOptional()
  @IsBoolean()
  allowPublicLinks?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'اجازه‌ی خروجی گرفتن اعضا' })
  @IsOptional()
  @IsBoolean()
  allowMemberExport?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'اجازه‌ی دعوت اعضا' })
  @IsOptional()
  @IsBoolean()
  allowMemberInvites?: boolean;
}
