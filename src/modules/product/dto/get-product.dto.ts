import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProductStatus } from 'src/modules/product/entities/product.entity';
import { BasicInfoDto } from 'src/types/common.dto';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetProductDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'ID nhà cung cấp',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'ID điểm đến',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  @IsOptional()
  @IsUUID()
  destinationId?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái sản phẩm',
    enum: ProductStatus,
    example: 'published',
  })
  @IsOptional()
  @IsString()
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Từ ngày (ISO 8601)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày (ISO 8601)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class ProductShortResponseDto {
  @ApiProperty({ example: '0df1ec7e-166e-4209-810a-23156b3b0489' })
  id: string;

  @ApiProperty({ example: 'Tour Hạ Long 3N2Đ' })
  name: string;

  @ApiProperty({ example: 'tour-ha-long-3n2d' })
  slug: string;

  @ApiProperty({ example: 'THL-001' })
  code: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg' })
  thumbnail: string;

  @ApiProperty({ example: 1500000 })
  minPrice: number;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.PUBLISHED })
  status: string;

  @ApiProperty({ example: 4.5 })
  reviewPoint: number;

  @ApiProperty({ type: BasicInfoDto })
  destination: BasicInfoDto;

  @ApiProperty({ type: BasicInfoDto })
  supplier: BasicInfoDto;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-15T00:00:00.000Z' })
  updatedAt: Date;
}

export class GetProductsResponseDto extends ListItemsResponse<ProductShortResponseDto> {
  @ApiProperty({ type: [ProductShortResponseDto] })
  declare items: ProductShortResponseDto[];
}
