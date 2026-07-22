import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { OptionStatus } from '../entities/option.entity';

export class CreateOptionDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'option title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'option description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  day?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  night?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ enum: OptionStatus, default: OptionStatus.ACTIVE })
  @IsOptional()
  @IsEnum(OptionStatus)
  status?: OptionStatus;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @ApiPropertyOptional({
    isArray: true,
    type: 'string',
    format: 'uuid',
    description: 'Array of allowed unit reference IDs',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  allowUnit?: string[];

  @ApiPropertyOptional({ example: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string;
}
