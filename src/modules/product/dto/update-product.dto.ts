import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  OmitType,
} from '@nestjs/swagger';
import { IsUUID, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  CreateProductDto,
  ProductOptionItemDto,
  ProductDepartureTimeItemDto,
  ProductPickupLocationItemDto,
  ProductUnitItemDto,
} from './create-product.dto';

export class UpdateProductOptionItemDto extends PartialType(
  ProductOptionItemDto,
) {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  id: string;
}

export class UpdateProductDepartureTimeItemDto extends PartialType(
  ProductDepartureTimeItemDto,
) {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  id: string;
}

export class UpdateProductPickupLocationItemDto extends PartialType(
  ProductPickupLocationItemDto,
) {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  id: string;
}

export class UpdateProductUnitItemDto extends PartialType(ProductUnitItemDto) {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  id: string;
}

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'options',
    'departureTimes',
    'pickupLocations',
    'units',
  ] as const),
) {
  @ApiPropertyOptional({ isArray: true, type: UpdateProductOptionItemDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductOptionItemDto)
  options?: UpdateProductOptionItemDto[];

  @ApiPropertyOptional({
    isArray: true,
    type: UpdateProductDepartureTimeItemDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductDepartureTimeItemDto)
  departureTimes?: UpdateProductDepartureTimeItemDto[];

  @ApiPropertyOptional({
    isArray: true,
    type: UpdateProductPickupLocationItemDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductPickupLocationItemDto)
  pickupLocations?: UpdateProductPickupLocationItemDto[];

  @ApiPropertyOptional({ isArray: true, type: UpdateProductUnitItemDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductUnitItemDto)
  units?: UpdateProductUnitItemDto[];
}
