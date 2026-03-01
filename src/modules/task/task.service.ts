import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { VideoService } from 'src/modules/video/video.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly videoService: VideoService) {}

  async onModuleInit() {
    await this.handleEmbeddingCron();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEmbeddingCron() {
    const prefixLog = `[handleEmbeddingCron] `;

    const videoEmbeddingMissing =
      await this.videoService.findEmbeddingMissing();

    this.logger.log(
      `${prefixLog} found ${videoEmbeddingMissing.length} video need to create embedding`,
    );

    for (const video of videoEmbeddingMissing) {
      try {
        await this.videoService.updateVideoEmbedding(video);
      } catch (error: any) {
        this.logger.error(`${prefixLog} error: ${error?.message}`);
        continue;
      }
    }
  }
}
