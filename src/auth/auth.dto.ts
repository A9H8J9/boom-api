import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'ایمیل حساب کاربری' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret1234', minLength: 1, description: 'رمز عبور' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Amir', minLength: 1, maxLength: 100, description: 'نام کاربر' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'ایمیل حساب کاربری' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret1234', minLength: 8, maxLength: 72, description: 'رمز عبور (حداقل ۸ کاراکتر)' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}

export class GoogleAuthDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...', description: 'ID token دریافت‌شده از Google Identity Services' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
