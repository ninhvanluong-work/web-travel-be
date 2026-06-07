import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BunnyCdnStream } from 'bunnycdn-stream';
import { VideoService } from 'src/modules/video/video.service';
import {
  BunnyVideoStatus,
  BunnyWebhookPayload,
} from 'src/modules/webhook/types/bunny-webhook.type';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);
  private readonly bunnyApiKey: string;
  private readonly bunnyLibraryId: string;

  constructor(
    private readonly videoService: VideoService,
    private readonly configService: ConfigService,
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
}
