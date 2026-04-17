import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SuggestQueryDto {
  @ApiProperty({ required: false, example: 'Ha Long' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class HotSearchDto {
  @ApiProperty({ example: 'Ha Long Bay' })
  query: string;

  @ApiProperty({ example: 42 })
  monthCount: number;
}

export class DestinationSuggestDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Ha Long' })
  name: string;
}

export class ProductSuggestDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Ha Long Bay Tour 3 Days' })
  name: string;

  @ApiProperty({ example: 'ha-long-bay-tour-3-days' })
  slug: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg', nullable: true })
  thumbnail: string;

  @ApiProperty({ example: 1500000 })
  minPrice: number;

  @ApiProperty({ example: 4.4 })
  reviewPoint: number;
}

export class SuggestResponseDto {
  @ApiProperty({ type: [HotSearchDto] })
  hotSearches: HotSearchDto[];

  @ApiProperty({ type: [DestinationSuggestDto] })
  destinations: DestinationSuggestDto[];

  @ApiProperty({ type: [ProductSuggestDto] })
  products: ProductSuggestDto[];
}
