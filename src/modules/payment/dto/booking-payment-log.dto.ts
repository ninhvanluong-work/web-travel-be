import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookingPaymentStatus } from 'src/modules/booking/entities/booking-payment.entity';

export class BookingPaymentLogDto {
  @ApiProperty({
    description: 'ID bản ghi log',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({
    description: 'ID booking payment liên quan',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  bookingPaymentId: string;

  @ApiPropertyOptional({
    description: 'ID booking liên quan',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  bookingId?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái trước khi thay đổi (null nếu là log đầu tiên)',
    enum: BookingPaymentStatus,
    nullable: true,
  })
  fromStatus?: BookingPaymentStatus | null;

  @ApiProperty({
    description: 'Trạng thái sau khi thay đổi',
    enum: BookingPaymentStatus,
    example: BookingPaymentStatus.SUCCEED,
  })
  toStatus: BookingPaymentStatus;

  @ApiPropertyOptional({
    description: 'Cổng thanh toán',
    example: 'vnpay',
  })
  provider?: string;

  @ApiPropertyOptional({
    description: 'Mã giao dịch phía cổng thanh toán',
    example: '14567890',
  })
  providerTxId?: string;

  @ApiPropertyOptional({
    description: 'Lý do thay đổi trạng thái (thường có khi thất bại)',
    example: 'Amount mismatch',
  })
  reason?: string;

  @ApiPropertyOptional({
    description:
      'Dữ liệu callback/response gốc từ cổng thanh toán tại thời điểm log',
    example: {},
  })
  rawResponse?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Nguồn gây ra thay đổi trạng thái',
    example: 'vnpay_callback',
  })
  source?: string;

  @ApiProperty({
    description: 'Thời điểm ghi log',
    example: '2026-08-16T10:00:00.000Z',
  })
  createdAt: Date;
}
