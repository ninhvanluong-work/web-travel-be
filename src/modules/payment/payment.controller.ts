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
import { CreateDemoOrderDto } from 'src/modules/payment/dto/create-demo-order.dto';

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

  // NOTE: literal routes below (config, demo/*) must stay declared before the
  // ':bookingId/*' routes, otherwise the ':bookingId' param would greedily
  // match the 'demo' segment first.
  @Get('config')
  @ApiResponse({
    status: 200,
    description:
      'public paypal config (client id + currency) for the demo page',
  })
  getConfig() {
    const result = this.paymentService.getPaypalPublicConfig();
    return formatApiResponse(result, HttpStatus.OK, 'paypal config');
  }

  @Post('demo/create-order')
  @ApiResponse({
    status: 200,
    description:
      'DEMO ONLY: create a paypal order for a fixed amount, not tied to any booking',
  })
  async createDemoOrder(@Body() dto: CreateDemoOrderDto) {
    const result = await this.paymentService.createDemoOrder(dto.amount ?? 10);
    return formatApiResponse(result, HttpStatus.OK, 'demo order created');
  }

  @Post('demo/capture-order')
  @ApiResponse({
    status: 200,
    description: 'DEMO ONLY: capture a demo paypal order',
  })
  async captureDemoOrder(@Body() dto: CapturePaymentDto) {
    const result = await this.paymentService.captureDemoOrder(dto.orderId);
    return formatApiResponse(result, HttpStatus.OK, 'demo order captured');
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
