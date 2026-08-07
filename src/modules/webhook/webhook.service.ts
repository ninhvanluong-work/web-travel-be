import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BunnyCdnStream } from 'bunnycdn-stream';
import { VideoService } from 'src/modules/video/video.service';
import {
  BunnyVideoStatus,
  BunnyWebhookPayload,
} from 'src/modules/webhook/types/bunny-webhook.type';
import { PaymentService } from 'src/modules/payment/payment.service';
import { PaypalWebhookEvent } from 'src/modules/payment/types/paypal.type';
import { VnpayCallbackQuery } from 'src/modules/payment/types/vnpay.type';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);
  private readonly bunnyApiKey: string;
  private readonly bunnyLibraryId: string;

  constructor(
    private readonly videoService: VideoService,
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
  ) {
    this.bunnyApiKey = this.configService.get<'string'>(
      'BUNNY_API_KEY',
    ) as string;

    this.bunnyLibraryId = this.configService.get<'string'>(
      'BUNNY_LIBRARY_ID',
    ) as string;
  }

  async handleBunnyWebhook(data: BunnyWebhookPayload) {
    const { VideoGuid, VideoLibraryId, Status } = data;
    const prefixLog = `[handleBunnyWebhook] videoGuid ${VideoGuid}, Status: ${Status}, Library: ${VideoLibraryId}`;
    await this.videoService.updateUploadingStatus(VideoGuid, Status);
    if (Status === BunnyVideoStatus.Finished) {
      this.logger.log(`${prefixLog} updating video duration`);
      const stream = new BunnyCdnStream({
        videoLibrary: this.bunnyLibraryId,
        apiKey: this.bunnyApiKey,
      });
      const videoInfo = await stream.getVideo(VideoGuid);
      const videoDuration = videoInfo?.length || 0;
      await this.videoService.updateByBunnyGuid(VideoGuid, {
        duration: videoDuration,
      });
    }
    this.logger.log(`${prefixLog} update status successfully!`);
  }

  async handlePaypalWebhook(event: PaypalWebhookEvent) {
    const prefixLog = `[handlePaypalWebhook] eventId=${event.id} type=${event.event_type}`;
    this.logger.log(prefixLog);

    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      this.logger.debug(`${prefixLog} ignored (unhandled event type)`);
      return;
    }

    const orderId = event.resource?.supplementary_data?.related_ids
      ?.order_id as string | undefined;
    const captureId = event.resource?.id as string | undefined;

    if (!orderId || !captureId) {
      this.logger.warn(`${prefixLog} missing orderId/captureId in resource`);
      return;
    }

    await this.paymentService.markPaymentSucceededByOrderId(
      orderId,
      captureId,
      event.resource,
    );
    this.logger.log(`${prefixLog} orderId=${orderId} marked as succeeded`);
  }

  async handleVnpayIpn(query: VnpayCallbackQuery) {
    const result = await this.paymentService.handleVnpayCallback(query);
    this.logger.log(`[handleVnpayIpn] txnRef=${result.txnRef}`);
    return result;
  }
}
