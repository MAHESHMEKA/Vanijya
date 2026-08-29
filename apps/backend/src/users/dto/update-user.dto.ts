import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ramesh Patel' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'ramesh@farmer.in' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Nashik' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'Village Pimpalgaon, Niphad, Nashik' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'FreshCart Agro Ltd.' })
  @IsString()
  @IsOptional()
  organization?: string;

  @ApiPropertyOptional({ example: '27AABCU9603R1ZM' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: '10019022009876' })
  @IsString()
  @IsOptional()
  fssai?: string;

  @ApiPropertyOptional({ example: 'KCC-MAH-992144' })
  @IsString()
  @IsOptional()
  kccNumber?: string;

  @ApiPropertyOptional({ example: 'APMC-NSK-TRD-401' })
  @IsString()
  @IsOptional()
  apmcLicense?: string;
}
