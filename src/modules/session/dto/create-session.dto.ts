import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SessionStatus } from '../entities/session.entity';

export class CreateSessionDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @IsDateString()
  travelDate: string;

  @ApiPropertyOptional({
    example: 20,
    description: 'số khả dụng cho phép book',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({
    enum: SessionStatus,
    default: SessionStatus.INACTIVE,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
