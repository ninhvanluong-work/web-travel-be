import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaymentService } from 'src/modules/payment/payment.service';
import { BookingPaymentLogDto } from 'src/modules/payment/dto/booking-payment-log.dto';
import { formatApiResponse } from 'src/common/utils/format';

@Controller('booking-payment')
@ApiExtraModels(BookingPaymentLogDto)
export class BookingPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id/logs')
  @ApiParam({
    name: 'id',
    description: 'ID của booking payment',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lấy lịch sử thay đổi trạng thái (timeline) của một booking payment, sắp xếp từ cũ đến mới',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(BookingPaymentLogDto) },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Booking payment not found',
  })
  async getLogs(@Param('id') id: string) {
    const result = await this.paymentService.getPaymentLogs(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'Get booking payment logs successfully',
    );
  }
}
