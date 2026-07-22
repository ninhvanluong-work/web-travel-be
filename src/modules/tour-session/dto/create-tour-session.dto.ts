import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsNumber,
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

  @ApiPropertyOptional({ example: '2026-08-01T07:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @ApiProperty({ example: 20, description: 'số lượng khách' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  capacity: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'số khả dụng cho phép book, mặc định bằng capacity',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  remainingSlot?: number;

  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  unitRefId?: string;

  @ApiProperty({ example: 1500000, description: 'giá từng slot' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    enum: TourSessionStatus,
    default: TourSessionStatus.INACTIVE,
  })
  @IsOptional()
  @IsEnum(TourSessionStatus)
  status?: TourSessionStatus;
}
