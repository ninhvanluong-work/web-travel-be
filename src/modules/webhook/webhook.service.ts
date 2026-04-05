import { Injectable, Logger } from '@nestjs/common';

import { VideoService } from 'src/modules/video/video.service';
import { BunnyWebhookPayload } from 'src/modules/webhook/types/bunny-webhook.type';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  constructor(private readonly videoService: VideoService) {}

  async handleBunnyWebhook(data: BunnyWebhookPayload) {
    const { VideoGuid, VideoLibraryId, Status } = data;
    const prefixLog = `[handleBunnyWebhook] videoGuid ${VideoGuid}, Status: ${Status}, Library: ${VideoLibraryId}`;
    await this.videoService.updateUploadingStatus(VideoGuid, Status);
    this.logger.log(`${prefixLog} update status successfully!`);
  }
}
