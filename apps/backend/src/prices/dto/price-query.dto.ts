import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PriceQueryDto {
  @ApiPropertyOptional({ description: 'Filter by Crop UUID' })
  @IsString()
  @IsOptional()
  cropId?: string;

  @ApiPropertyOptional({ description: 'Filter by Crop Name (e.g. Tomato, Onion, Paddy)' })
  @IsString()
  @IsOptional()
  cropName?: string;

  @ApiPropertyOptional({ description: 'Filter by Market UUID' })
  @IsString()
  @IsOptional()
  marketId?: string;

  @ApiPropertyOptional({ description: 'Filter by District name (e.g. Nashik, Ludhiana)' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: 'Filter by State name (e.g. Maharashtra, Punjab)' })
  @IsString()
  @IsOptional()
  state?: string;
}

export class PriceTrendsQueryDto {
  @ApiPropertyOptional({ description: 'Crop UUID or Crop Name (default: Tomato)' })
  @IsString()
  @IsOptional()
  cropId?: string;

  @ApiPropertyOptional({ description: 'Crop Name (e.g. Tomato, Onion, Paddy)' })
  @IsString()
  @IsOptional()
  cropName?: string;

  @ApiPropertyOptional({ description: 'Market UUID or Market Name' })
  @IsString()
  @IsOptional()
  marketId?: string;

  @ApiPropertyOptional({ description: 'Number of historical days (default 7)' })
  @IsNumberString()
  @IsOptional()
  days?: string;
}

export class PriceCompareQueryDto {
  @ApiPropertyOptional({ description: 'Crop UUID or Crop Name to compare across APMCs' })
  @IsString()
  @IsOptional()
  cropId?: string;

  @ApiPropertyOptional({ description: 'Crop Name (e.g. Tomato, Onion, Paddy)' })
  @IsString()
  @IsOptional()
  cropName?: string;

  @ApiPropertyOptional({ example: 19.9975, description: 'User latitude (e.g. Farmer farm location)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userLat?: number;

  @ApiPropertyOptional({ example: 73.7898, description: 'User longitude' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userLng?: number;

  @ApiPropertyOptional({ description: 'Filter by State name' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 250, description: 'Maximum search radius in kilometers (default: 250)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxDistanceKm?: number;
}

export class PriceDashboardQueryDto {
  @ApiPropertyOptional({ example: 'Tomato', description: 'Crop Name or UUID for market snapshot' })
  @IsString()
  @IsOptional()
  cropName?: string;

  @ApiPropertyOptional({ description: 'Crop UUID' })
  @IsString()
  @IsOptional()
  cropId?: string;

  @ApiPropertyOptional({ example: 'Nashik', description: 'Farmer home district' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: 19.9975, description: 'Farmer location latitude' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userLat?: number;

  @ApiPropertyOptional({ example: 73.7898, description: 'Farmer location longitude' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userLng?: number;
}
