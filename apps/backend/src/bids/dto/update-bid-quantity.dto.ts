import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateBidQuantityDto {
  @ApiProperty({ example: 80, description: 'Updated quantity in lot units (must be > 0 and <= lot total quantity)' })
  @IsNumber()
  @Min(0.01)
  quantity: number;
}
