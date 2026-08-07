import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { PaymentService } from 'src/modules/payment/payment.service';
import type { VnpayCallbackQuery } from 'src/modules/payment/types/vnpay.type';

import { formatApiResponse } from 'src/common/utils/format';
import { UserId } from 'src/common/decorators';
import { OptionalUserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

@Controller('payment/vnpay')
export class VnpayPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':bookingId/create-payment-url')
  @ApiBearerAuth(USER_TOKEN)
  @UseGuards(OptionalUserGuard)
  @ApiResponse({
    status: 200,
    description:
      'create a vnpay payment url for a pending booking, returns the redirect url',
  })
  async createPaymentUrl(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Req() req: Request,
  ) {
    const result = await this.paymentService.createVnpayPaymentUrl(
      userId,
      bookingId,
      getClientIp(req),
    );
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'vnpay payment url created successfully',
    );
  }

  // VNPAY redirects the user's browser here after payment. Signature is
  // verified here too, but the IPN endpoint (src/modules/webhook) remains
  // the source of truth for marking a booking as paid. This endpoint never
  // renders JSON to the browser - it always redirects to FRONTEND_URL so
  // the frontend page can show the result to the user.
  @Get('return')
  async verifyReturn(@Query() query: VnpayCallbackQuery, @Res() res: Response) {
    const result = await this.paymentService.handleVnpayCallback(query);
    const redirectUrl = this.paymentService.buildVnpayReturnRedirectUrl(result);
    return res.redirect(redirectUrl);
  }
}
