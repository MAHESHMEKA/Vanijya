import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
