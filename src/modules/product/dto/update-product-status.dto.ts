import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';
import { IdDto } from 'src/types/common.dto';

export const UpdateProductStatusEnum = Object.values(ProductStatus).filter(
  (status) => status !== ProductStatus.DRAFT,
);

export class UpdateProductStatusDto extends IdDto {
  @ApiProperty({
    enum: UpdateProductStatusEnum,
    example: ProductStatus.PUBLISHED,
  })
  @IsEnum(UpdateProductStatusEnum)
  status: ProductStatus;
}
