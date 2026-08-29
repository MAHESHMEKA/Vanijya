import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectUserDto {
  @ApiProperty({
    example: 'Incomplete land record documentation and invalid contact number.',
    description: 'Specific reason for rejecting user registration',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  reason: string;
}
