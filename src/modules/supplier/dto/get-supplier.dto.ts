import { ApiProperty } from '@nestjs/swagger';

import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetSuppliersDto extends PaginationDto {}

export class GetSuppliersResponseDto extends ListItemsResponse<Supplier> {
  @ApiProperty({ type: [Supplier] })
  declare items: Supplier[];
}
