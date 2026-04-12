import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsUrl,
  IsInt,
  Min,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';

export class ItineraryDto {
  @ApiProperty({ example: 'itinerary title' })
  name: string;

  @ApiProperty({ example: 'day 1' })
  featuredName: string;

  @ApiProperty({ type: 'integer', example: '1', default: '1' })
  order: number;

  @ApiProperty({ type: 'string', example: 'description...' })
  description: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Hạ Long Bay Tour' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Detailed description of the tour...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'ha-long-bay-tour' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiPropertyOptional({
    example: ['img1.jpg', 'img2.jpg'],
    description: 'Array of image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/itinerary.jpg' })
  @IsOptional()
  @IsUrl()
  itineraryImage?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ example: 'day' })
  @IsOptional()
  @IsString()
  durationType?: string;

  @ApiPropertyOptional({ example: 'Visit cave, swimming...' })
  @IsOptional()
  @IsString()
  highlight?: string;

  @ApiPropertyOptional({ example: 'Lunch, Guide, Entrance fee' })
  @IsOptional()
  @IsString()
  include?: string;

  @ApiPropertyOptional({ example: 'Personal expenses, VAT' })
  @IsOptional()
  @IsString()
  exclude?: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 1500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  destinationId?: string;

  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  heroVideoId?: string;

  @ApiPropertyOptional({ isArray: true, type: ItineraryDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDto)
  itineraries: ItineraryDto[];
}
