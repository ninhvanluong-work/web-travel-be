import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { SupplierPaymentMethod } from 'src/modules/supplier/entities/supplier-payment.entity';
import { SupplierPaymentDetailsDto } from 'src/modules/supplier/dto/supplier-payment-details.dto';

export class CreateSupplierPaymentDto {
  @ApiProperty({ example: '0df1ec7e-166e-4209-810a-23156b3b0489' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({
    enum: SupplierPaymentMethod,
    default: SupplierPaymentMethod.BANK,
  })
  @IsEnum(SupplierPaymentMethod)
  method: SupplierPaymentMethod;

  @ApiProperty({ example: 'VND', default: 'VND', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ type: SupplierPaymentDetailsDto })
  @ValidateNested()
  @Type(() => SupplierPaymentDetailsDto)
  details: SupplierPaymentDetailsDto;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
