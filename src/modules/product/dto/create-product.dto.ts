import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
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
import {
  ProductStatus,
  BannerItem,
  ReadBefore,
  ExperienceItem,
} from '../entities/product.entity';
import { CreateOptionDto } from 'src/modules/option/dto/create-option.dto';
import { CreateDepartureTimeDto } from 'src/modules/departure-time/dto/create-departure-time.dto';
import { CreatePickupLocationDto } from 'src/modules/pickup-location/dto/create-pickup-location.dto';

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

export class ProductOptionItemDto extends OmitType(CreateOptionDto, [
  'productId',
  'day',
  'night',
  'isDefault',
  'allowUnit',
] as const) {}

export class ProductDepartureTimeItemDto extends OmitType(
  CreateDepartureTimeDto,
  ['productId'] as const,
) {}

export class ProductPickupLocationItemDto extends OmitType(
  CreatePickupLocationDto,
  ['productId'] as const,
) {}

export class CreateProductDto {
  @ApiProperty({ example: 'Hạ Long Bay Tour' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Detailed description of the tour...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Short description of the tour...' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

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

  @ApiPropertyOptional({ example: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string;

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

  @ApiPropertyOptional({
    isArray: true,
    type: 'string',
    format: 'uuid',
    description: 'Array of tag IDs',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    isArray: true,
    type: 'string',
    format: 'uuid',
    description: 'Array of tour guide IDs',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tourGuideIds?: string[];

  @ApiPropertyOptional({
    isArray: true,
    type: 'string',
    format: 'uuid',
    description: 'Array of element IDs',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  elementIds?: string[];

  @ApiPropertyOptional({
    isArray: true,
    type: BannerItem,
    example: [
      { type: 'image', url: 'https://example.com/banner.jpg' },
      { type: 'video', url: 'https://example.com/banner.mp4' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerItem)
  banner?: BannerItem[];

  @ApiPropertyOptional({
    isArray: true,
    type: ReadBefore,
    example: [
      {
        key: 'passport',

        title: 'Passport Required',
        description: 'You need a valid passport to enter the country',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReadBefore)
  readBefore?: ReadBefore[];

  @ApiPropertyOptional({ isArray: true, type: ItineraryDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDto)
  itineraries: ItineraryDto[];

  @ApiPropertyOptional({
    isArray: true,
    type: ExperienceItem,
    example: [
      {
        imageUrl: 'https://example.com/image.jpg',
        title: 'Sunset cruise',
        content: 'Enjoy a relaxing sunset cruise with live music',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItem)
  experience?: ExperienceItem[];

  @ApiPropertyOptional({ isArray: true, type: ProductOptionItemDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionItemDto)
  options?: ProductOptionItemDto[];

  @ApiPropertyOptional({ isArray: true, type: ProductDepartureTimeItemDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDepartureTimeItemDto)
  departureTimes?: ProductDepartureTimeItemDto[];

  @ApiPropertyOptional({ isArray: true, type: ProductPickupLocationItemDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPickupLocationItemDto)
  pickupLocations?: ProductPickupLocationItemDto[];
}
