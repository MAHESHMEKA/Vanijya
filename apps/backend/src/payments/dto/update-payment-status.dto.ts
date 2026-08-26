import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus, description: 'New payment status: PENDING, INITIATED, PAID, FAILED' })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiPropertyOptional({ example: 'UPI/REF-2024-99823', description: 'Bank / UPI / Escrow payment reference identifier' })
  @IsString()
  @IsOptional()
  paymentReference?: string;
}
