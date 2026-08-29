import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: '9876543210', description: 'Phone number or email address' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'Farmer@123', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: 'cpt-17879029910-a1b2',
    description: 'Server-issued CAPTCHA challenge ID from GET /api/auth/captcha',
  })
  @IsString()
  @IsOptional()
  captchaId?: string;

  @ApiPropertyOptional({
    example: 'K7P4X',
    description: 'User-entered alphanumeric CAPTCHA answer',
  })
  @IsString()
  @IsOptional()
  captchaAnswer?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.FARMER,
    description: 'Optional selected role on login form to verify account match',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
