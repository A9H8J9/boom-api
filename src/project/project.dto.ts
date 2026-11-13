import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListProjectsQueryDto {
  @ApiProperty({ example: 'cmwavf50t00015ccxqyil8rmz', description: 'شناسه‌ی ورک‌اسپیس' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}

export class RenameProjectDto {
  @ApiProperty({ example: 'Renamed Project', minLength: 1, maxLength: 150, description: 'نام جدید پروژه' })
  @IsString()
  @Length(1, 150)
  name: string;
}
