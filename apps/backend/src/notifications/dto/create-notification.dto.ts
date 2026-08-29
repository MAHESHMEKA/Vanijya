import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Target recipient user ID' })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({ enum: NotificationType, description: 'Type of notification event' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed notification body text' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Associated entity type (e.g. LOT, BID, TRANSACTION)' })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Associated entity UUID' })
  @IsString()
  @IsOptional()
  entityId?: string;
}
