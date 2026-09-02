import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, ApprovalStatus, VerificationStatus } from '../../database/schemas/enums';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiPropertyOptional({ enum: VerificationStatus })
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({ enum: ApprovalStatus })
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({ nullable: true })
  rejectionReason?: string | null;

  @ApiPropertyOptional({ nullable: true })
  profilePhoto?: any;

  @ApiPropertyOptional({ nullable: true })
  district: string | null;

  @ApiPropertyOptional({ nullable: true })
  state: string | null;

  @ApiPropertyOptional({ nullable: true })
  village?: string | null;

  @ApiPropertyOptional({ nullable: true })
  location: string | null;

  @ApiPropertyOptional({ nullable: true })
  geoPoint?: any;

  @ApiPropertyOptional({ nullable: true })
  primaryCrop?: string | null;

  @ApiPropertyOptional({ nullable: true })
  farmSize?: number | null;

  @ApiPropertyOptional({ nullable: true })
  preferredLanguage?: string | null;

  @ApiPropertyOptional({ nullable: true })
  organization?: string | null;

  @ApiPropertyOptional({ nullable: true })
  contactPerson?: string | null;

  @ApiPropertyOptional({ nullable: true })
  businessType?: string | null;

  @ApiPropertyOptional({ nullable: true })
  warehouseLocation?: string | null;

  @ApiPropertyOptional({ nullable: true })
  gstin?: string | null;

  @ApiPropertyOptional({ nullable: true })
  fssai?: string | null;

  @ApiPropertyOptional({ nullable: true })
  kccNumber?: string | null;

  @ApiPropertyOptional({ nullable: true })
  apmcLicense?: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional()
  profileCompletionPercentage?: number;

  @ApiPropertyOptional({ enum: ['COMPLETE', 'INCOMPLETE'] })
  profileCompletionStatus?: 'COMPLETE' | 'INCOMPLETE';

  @ApiPropertyOptional({ type: [String] })
  missingFields?: string[];
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT Bearer Access Token' })
  accessToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
