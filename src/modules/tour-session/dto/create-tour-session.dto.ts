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

import { TourSessionStatus } from '../entities/tour-session.entity';

export class CreateTourSessionDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  optionId: string;

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
  remainingSlot?: number;

  @ApiPropertyOptional({
    enum: TourSessionStatus,
    default: TourSessionStatus.INACTIVE,
  })
  @IsOptional()
  @IsEnum(TourSessionStatus)
  status?: TourSessionStatus;
}
