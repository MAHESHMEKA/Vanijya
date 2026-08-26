import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({ example: 2350, description: 'Offered bid price per unit (₹)' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 50, description: 'Procurement quantity' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: 'Direct farm gate pickup with immediate payment' })
  @IsString()
  @IsOptional()
  message?: string;
}
