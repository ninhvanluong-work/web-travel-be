import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { PaymentService } from 'src/modules/payment/payment.service';
import { CapturePaymentDto } from 'src/modules/payment/dto/capture-payment.dto';

import { formatApiResponse } from 'src/common/utils/format';
import { UserId } from 'src/common/decorators';
import { OptionalUserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

class BookingIdParam {
  @IsUUID()
  bookingId: string;
}

@Controller('payment/paypal')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('config')
  @ApiResponse({
    status: 200,
    description: 'public paypal config (client id + currency)',
  })
  getConfig() {
    const result = this.paymentService.getPaypalPublicConfig();
    return formatApiResponse(result, HttpStatus.OK, 'paypal config');
  }

  @Post(':bookingId/create-order')
  @ApiBearerAuth(USER_TOKEN)
  @UseGuards(OptionalUserGuard)
  @ApiResponse({
    status: 200,
    description:
      'create a paypal order for a pending booking, returns the buyer approval url',
  })
  async createOrder(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
  ) {
    const result = await this.paymentService.createPaypalOrder(
      userId,
      bookingId,
    );
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'paypal order created successfully',
    );
  }

  @Post(':bookingId/capture-order')
  @ApiBearerAuth(USER_TOKEN)
  @UseGuards(OptionalUserGuard)
  @ApiResponse({
    status: 200,
    description:
      'capture a previously approved paypal order and mark the booking as paid',
  })
  async captureOrder(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CapturePaymentDto,
  ) {
    const result = await this.paymentService.capturePaypalOrder(
      userId,
      bookingId,
      dto.orderId,
    );
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'payment captured successfully',
    );
  }
}
