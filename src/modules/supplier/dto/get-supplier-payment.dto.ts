import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import {
  SupplierPayment,
  SupplierPaymentMethod,
} from 'src/modules/supplier/entities/supplier-payment.entity';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetSupplierPaymentsDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiProperty({ required: false, enum: SupplierPaymentMethod })
  @IsOptional()
  @IsEnum(SupplierPaymentMethod)
  method?: SupplierPaymentMethod;
}

export class GetSupplierPaymentsResponseDto extends ListItemsResponse<SupplierPayment> {
  @ApiProperty({ type: [SupplierPayment] })
  declare items: SupplierPayment[];
}
