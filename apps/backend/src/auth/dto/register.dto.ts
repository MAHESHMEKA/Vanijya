import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Ramesh Patel', description: 'Full legal name of the user or contact person' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9876543210', description: '10-digit Indian Mobile Number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'ramesh@farmer.in', description: 'Email address (optional for farmers, required for buyers)' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Farmer@123', description: 'Strong password with min 8 chars, uppercase, lowercase, number, special char' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: Role, example: Role.FARMER, description: 'Role of the account: FARMER or BUYER' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'Maharashtra', description: 'State name' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Nashik', description: 'District name' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ example: 'Pimpalgaon Baswant', description: 'Village name (for farmers)' })
  @IsString()
  @IsOptional()
  village?: string;

  @ApiPropertyOptional({ example: 'Village Pimpalgaon, Niphad Taluka', description: 'Farm-gate or procurement dispatch location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'Tomato', description: 'Primary crop cultivated (farmers)' })
  @IsString()
  @IsOptional()
  primaryCrop?: string;

  @ApiPropertyOptional({ example: 5.5, description: 'Farm size in acres (farmers)' })
  @IsNumber()
  @IsOptional()
  farmSize?: number;

  @ApiPropertyOptional({ example: 'en', description: 'Preferred language code (en, hi, te)' })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @ApiPropertyOptional({ example: 'FreshCart Agro Limited', description: 'Organization or Company Name (buyers)' })
  @IsString()
  @IsOptional()
  organization?: string;

  @ApiPropertyOptional({ example: 'Praveen Kumar', description: 'Authorized contact person (buyers)' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'Wholesale Trader / Processor', description: 'Business classification (buyers)' })
  @IsString()
  @IsOptional()
  businessType?: string;

  @ApiPropertyOptional({ example: 'Vashi APMC Sector 19', description: 'Primary warehouse / receiving hub location' })
  @IsString()
  @IsOptional()
  warehouseLocation?: string;

  @ApiPropertyOptional({ example: '27AABCU9603R1ZM', description: 'GSTIN tax registration number' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: '10019022009876', description: 'FSSAI food safety license' })
  @IsString()
  @IsOptional()
  fssai?: string;

  @ApiPropertyOptional({ example: 'KCC-MAH-992144', description: 'Kisan Credit Card (KCC) reference number' })
  @IsString()
  @IsOptional()
  kccNumber?: string;

  @ApiPropertyOptional({ example: 'APMC-NSK-TRD-401', description: 'APMC Mandi license reference number' })
  @IsString()
  @IsOptional()
  apmcLicense?: string;

  @ApiPropertyOptional({ example: 'cpt-17879029910-a1b2', description: 'Visual CAPTCHA challenge ID' })
  @IsString()
  @IsOptional()
  captchaId?: string;

  @ApiPropertyOptional({ example: 'K7P4X', description: 'Visual CAPTCHA answer entered by user' })
  @IsString()
  @IsOptional()
  captchaAnswer?: string;
}
