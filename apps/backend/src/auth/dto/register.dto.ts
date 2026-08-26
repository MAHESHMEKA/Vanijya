import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Ramesh Patel', description: 'Full legal name of the user or enterprise' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '9876543210', description: '10-digit Indian Mobile Number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'ramesh@farmer.in', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Farmer@123', description: 'Minimum 6 character secure password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, default: Role.FARMER, description: 'Role of the account: FARMER, BUYER, or ADMIN' })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ example: 'Nashik', description: 'District name' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: 'Maharashtra', description: 'State name' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'Village Pimpalgaon, Niphad', description: 'Village or APMC Location' })
  @IsString()
  @IsOptional()
  location?: string;
}
