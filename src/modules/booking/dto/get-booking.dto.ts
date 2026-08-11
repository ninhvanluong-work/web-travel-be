import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import {
  Booking,
  BookingStatus,
} from 'src/modules/booking/entities/booking.entity';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetBookingDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'ID nhà cung cấp',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'ID sản phẩm',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái booking',
    enum: BookingStatus,
    example: BookingStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'Từ ngày khởi hành (ISO 8601)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày khởi hành (ISO 8601)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class GetBookingsResponseDto extends ListItemsResponse<Booking> {
  @ApiProperty({ type: [Booking] })
  declare items: Booking[];
}
