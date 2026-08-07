import crypto from 'crypto';
import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WebhookService } from './webhook.service';
import { BunnyWebhookPayload } from 'src/modules/webhook/types/bunny-webhook.type';
import { PaypalWebhookEvent } from 'src/modules/payment/types/paypal.type';
import { PaypalService } from 'src/modules/payment/paypal.service';
import type { VnpayCallbackQuery } from 'src/modules/payment/types/vnpay.type';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
    private readonly paypalService: PaypalService,
  ) {}

  validateWebhookSignature(
    rawBody: string,
    signatureHeader: string,
    signatureVersion: string,
    signatureAlgorithm: string,
    signatureSecret: string,
  ) {
    if (signatureVersion !== 'v1') {
      return false;
    }

    if (signatureAlgorithm !== 'hmac-sha256') {
      return false;
    }

    const expectedHex = crypto
      .createHmac('sha256', signatureSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    if (
      typeof signatureHeader !== 'string' ||
      signatureHeader.length !== expectedHex.length ||
      !/^[0-9a-f]+$/.test(signatureHeader)
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedHex, 'utf8'),
      Buffer.from(signatureHeader, 'utf8'),
    );
  }

  @Post('/bunny')
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
    @Headers('x-bunnystream-signature') signature: string,
    @Headers('x-bunnystream-signature-version') version: string,
    @Headers('x-bunnystream-signature-algorithm') algorithm: string,
  ) {
    if (!signature || !version || !algorithm) {
      throw new UnauthorizedException('Missing signature headers');
    }

    const rawBody = req.rawBody?.toString('utf8');

    if (!rawBody) {
      throw new UnauthorizedException('Missing body');
    }

    const readonlyApiKey = this.configService.get<'STRING'>(
      'BUNNY_READONLY_API_KEY',
    ) as string;

    const isValid = this.validateWebhookSignature(
      rawBody,
      signature,
      version,
      algorithm,
      readonlyApiKey,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const data = JSON.parse(rawBody) as BunnyWebhookPayload;
    await this.webhookService.handleBunnyWebhook(data);

    return { success: true };
  }

  @Post('/paypal')
  async handlePaypalWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('paypal-auth-algo') authAlgo: string,
    @Headers('paypal-cert-url') certUrl: string,
    @Headers('paypal-transmission-id') transmissionId: string,
    @Headers('paypal-transmission-sig') transmissionSig: string,
    @Headers('paypal-transmission-time') transmissionTime: string,
  ) {
    if (
      !authAlgo ||
      !certUrl ||
      !transmissionId ||
      !transmissionSig ||
      !transmissionTime
    ) {
      throw new UnauthorizedException('Missing paypal signature headers');
    }

    const rawBody = req.rawBody?.toString('utf8');
    if (!rawBody) {
      throw new UnauthorizedException('Missing body');
    }

    const event = JSON.parse(rawBody) as PaypalWebhookEvent;

    const isValid = await this.paypalService.verifyWebhookSignature(
      {
        'paypal-auth-algo': authAlgo,
        'paypal-cert-url': certUrl,
        'paypal-transmission-id': transmissionId,
        'paypal-transmission-sig': transmissionSig,
        'paypal-transmission-time': transmissionTime,
      },
      event,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid paypal webhook signature');
    }

    await this.webhookService.handlePaypalWebhook(event);

    return { success: true };
  }

  // VNPAY calls this server-to-server (GET) after processing a payment.
  // This is the authoritative source for marking a booking as paid; the
  // payment/vnpay/return endpoint only reflects the browser redirect.
  @Get('/vnpay/ipn')
  async handleVnpayIpn(@Query() query: VnpayCallbackQuery) {
    const result = await this.webhookService.handleVnpayIpn(query);

    if (!result.isValid) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }
    if (!result.paymentFound) {
      return { RspCode: '01', Message: 'Order not found' };
    }
    if (!result.amountMatches) {
      return { RspCode: '04', Message: 'Invalid amount' };
    }

    return { RspCode: '00', Message: 'Confirm Success' };
  }
}
