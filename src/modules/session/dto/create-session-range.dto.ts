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

export class CreateSessionRangeDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: '2026-08-01',
    description: 'Ngày bắt đầu (cũng là ngày duy nhất nếu không truyền toDate)',
  })
  @IsDateString()
  fromDate: string;

  @ApiPropertyOptional({
    example: '2026-08-05',
    description: 'Ngày kết thúc (bao gồm). Bỏ trống nếu chỉ tạo 1 ngày',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  //@ApiPropertyOptional({
  //  example: 20,
  //  description:
  //    'số khả dụng cho phép book, áp dụng cho tất cả session được tạo',
  //})
  //@IsOptional()
  //@Type(() => Number)
  //@IsInt()
  //@Min(0)
  //capacity?: number;

  //@ApiPropertyOptional({
  //  enum: SessionStatus,
  //  default: SessionStatus.INACTIVE,
  //})
  //@IsOptional()
  //@IsEnum(SessionStatus)
  //status?: SessionStatus;
}
