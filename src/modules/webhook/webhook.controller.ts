import crypto from 'crypto';
import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WebhookService } from './webhook.service';
import { BunnyWebhookPayload } from 'src/modules/webhook/types/bunny-webhook.type';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
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
}
