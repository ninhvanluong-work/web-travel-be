import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductStatus,
  BannerItem,
  ReadBefore,
} from 'src/modules/product/entities/product.entity';

class TagDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'adventure' })
  name: string;
}

class TourGuideDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiProperty({ example: 120 })
  ratingCount: number;

  @ApiProperty({ example: 5 })
  expYear: number;

  @ApiProperty({ example: 4.5 })
  ratingStar: number;
}

class ItineraryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'itinerary title' })
  name: string;

  @ApiPropertyOptional({ example: 'day 1' })
  featuredName?: string;

  @ApiProperty({ type: 'integer', example: 1 })
  order: number;

  @ApiPropertyOptional({ type: 'string' })
  description?: string;
}

export class ProductDetailDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Hạ Long Bay Tour' })
  name: string;

  @ApiPropertyOptional({ example: 'Detailed description of the tour...' })
  description?: string;

  @ApiPropertyOptional({ example: 'Short description of the tour...' })
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'ha-long-bay-tour' })
  slug?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  thumbnail?: string;

  @ApiPropertyOptional({ example: 'PROD-001' })
  code?: string;

  @ApiPropertyOptional({
    example: ['img1.jpg', 'img2.jpg'],
    description: 'Array of image URLs',
  })
  images?: string[];

  @ApiPropertyOptional({
    isArray: true,
    type: BannerItem,
    description: 'Array of banner items',
  })
  banner?: BannerItem[];

  @ApiPropertyOptional({
    isArray: true,
    type: ReadBefore,
    description: 'Array of read before items',
  })
  readBefore?: ReadBefore[];

  @ApiPropertyOptional({ example: 'https://example.com/itinerary.jpg' })
  itineraryImage?: string;

  @ApiProperty({ example: 3 })
  duration: number;

  @ApiPropertyOptional({ example: 'day', description: 'day, hour, etc.' })
  durationType?: string;

  @ApiPropertyOptional({ example: 'Visit cave, swimming...' })
  highlight?: string;

  @ApiPropertyOptional({ example: 'Lunch, Guide, Entrance fee' })
  include?: string;

  @ApiPropertyOptional({ example: 'Personal expenses, VAT' })
  exclude?: string;

  @ApiProperty({ enum: ProductStatus, example: 'published' })
  status: ProductStatus;

  @ApiProperty({ example: 1500000 })
  minPrice: number;

  @ApiProperty({ example: 4.5 })
  reviewPoint: number;

  @ApiProperty({ example: 300 })
  reviewCount: number;

  @ApiProperty({
    type: () => [ItineraryDto],
    description: 'List of itineraries',
  })
  itineraries: ItineraryDto[];

  @ApiProperty({
    type: () => [TourGuideDto],
    description: 'List of tour guides',
  })
  tourGuides: TourGuideDto[];

  @ApiProperty({
    type: () => [TagDto],
    description: 'List of tags',
  })
  tags: TagDto[];

  @ApiProperty({ example: '2026-05-11T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-11T00:00:00.000Z' })
  updatedAt: Date;
}
