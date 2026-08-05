import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsUUID, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  CreateProductDto,
  ProductOptionItemDto,
  ProductDepartureTimeItemDto,
  ProductPickupLocationItemDto,
  ProductUnitItemDto,
} from './create-product.dto';

const ID_DESCRIPTION =
  'If provided, updates the existing record with this id; if omitted, a new record is created. Any existing record not referenced by id is deleted.';

export class UpdateProductOptionItemDto extends PartialType(
  ProductOptionItemDto,
) {
  @ApiPropertyOptional({
    example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0',
    description: ID_DESCRIPTION,
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class UpdateProductDepartureTimeItemDto extends PartialType(
  ProductDepartureTimeItemDto,
) {
  @ApiPropertyOptional({
    example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0',
    description: ID_DESCRIPTION,
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class UpdateProductPickupLocationItemDto extends PartialType(
  ProductPickupLocationItemDto,
) {
  @ApiPropertyOptional({
    example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0',
    description: ID_DESCRIPTION,
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class UpdateProductUnitItemDto extends PartialType(ProductUnitItemDto) {
  @ApiPropertyOptional({
    example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0',
    description: ID_DESCRIPTION,
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'options',
    'departureTimes',
    'pickupLocations',
    'units',
  ] as const),
) {
  @ApiPropertyOptional({
    isArray: true,
    type: UpdateProductOptionItemDto,
    description:
      'Full list of options for this product. Items with id are updated, items without id are created, existing options not listed here are deleted.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductOptionItemDto)
  options?: UpdateProductOptionItemDto[];

  @ApiPropertyOptional({
    isArray: true,
    type: UpdateProductDepartureTimeItemDto,
    description:
      'Full list of departure times for this product. Items with id are updated, items without id are created, existing departure times not listed here are deleted.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductDepartureTimeItemDto)
  departureTimes?: UpdateProductDepartureTimeItemDto[];

  @ApiPropertyOptional({
    isArray: true,
    type: UpdateProductPickupLocationItemDto,
    description:
      'Full list of pickup locations for this product. Items with id are updated, items without id are created, existing pickup locations not listed here are deleted.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductPickupLocationItemDto)
  pickupLocations?: UpdateProductPickupLocationItemDto[];

  @ApiPropertyOptional({
    isArray: true,
    type: UpdateProductUnitItemDto,
    description:
      'Full list of units for this product. Items with id are updated, items without id are created, existing units not listed here are deleted.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductUnitItemDto)
  units?: UpdateProductUnitItemDto[];
}
