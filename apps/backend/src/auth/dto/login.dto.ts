import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '9876543210', description: 'Phone number or email address' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'Farmer@123', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
