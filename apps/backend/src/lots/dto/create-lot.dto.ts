import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { QualityGrade, CropLotStatus } from '../../database/schemas/enums';

export class CreateCropLotDto {
  @ApiProperty({ description: 'Crop ID' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 50, description: 'Harvested lot quantity' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: 'QUINTAL', default: 'QUINTAL' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 2200, description: 'Expected price per unit (₹)' })
  @IsNumber()
  @IsPositive()
  expectedPrice: number;

  @ApiProperty({ enum: QualityGrade, default: QualityGrade.GRADE_A })
  @IsEnum(QualityGrade)
  qualityGrade: QualityGrade;

  @ApiProperty({ example: 'Village Pimpalgaon, Niphad, Nashik', description: 'Farm / pickup location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: '2024-10-20T00:00:00.000Z' })
  @IsOptional()
  harvestDate?: string;
}

export class UpdateCropLotDto {
  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 2300 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  expectedPrice?: number;

  @ApiPropertyOptional({ enum: QualityGrade })
  @IsEnum(QualityGrade)
  @IsOptional()
  qualityGrade?: QualityGrade;

  @ApiPropertyOptional({ example: 'Updated farm location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ enum: CropLotStatus })
  @IsEnum(CropLotStatus)
  @IsOptional()
  status?: CropLotStatus;
}

export class QueryLotsDto {
  @ApiPropertyOptional({ description: 'Filter by Crop ID' })
  @IsString()
  @IsOptional()
  cropId?: string;

  @ApiPropertyOptional({ description: 'Filter by Farmer ID' })
  @IsString()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({ enum: CropLotStatus })
  @IsEnum(CropLotStatus)
  @IsOptional()
  status?: CropLotStatus;

  @ApiPropertyOptional({ enum: QualityGrade })
  @IsEnum(QualityGrade)
  @IsOptional()
  qualityGrade?: QualityGrade;

  @ApiPropertyOptional({ description: 'Filter by District/Location keyword' })
  @IsString()
  @IsOptional()
  location?: string;
}
