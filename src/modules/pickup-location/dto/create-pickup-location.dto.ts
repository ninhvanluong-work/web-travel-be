import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePickupLocationDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'pickup location name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'pickup location address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: 'https://maps.google.com/...' })
  @IsOptional()
  @IsString()
  mapUrl?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
