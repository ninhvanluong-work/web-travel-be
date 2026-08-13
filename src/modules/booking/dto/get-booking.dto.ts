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

export class BookingStatItemDto {
  @ApiProperty({ description: 'Số lượng booking', example: 5 })
  count: number;

  @ApiProperty({ description: 'Tổng tiền', example: 1500000 })
  totalPrice: number;
}

export class BookingStatDto {
  @ApiProperty({ type: BookingStatItemDto })
  pending: BookingStatItemDto;

  @ApiProperty({ type: BookingStatItemDto })
  paid: BookingStatItemDto;

  @ApiProperty({ type: BookingStatItemDto })
  cancel: BookingStatItemDto;

  @ApiProperty({
    description: 'Tổng hợp tất cả trạng thái',
    type: BookingStatItemDto,
  })
  total: BookingStatItemDto;
}

export class GetBookingsResponseDto extends ListItemsResponse<
  Booking,
  BookingStatDto
> {
  @ApiProperty({ type: [Booking] })
  declare items: Booking[];

  @ApiProperty({ type: BookingStatDto })
  declare stats: BookingStatDto;
}
