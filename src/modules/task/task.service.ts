import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { VideoService } from 'src/modules/video/video.service';
import { SearchingService } from 'src/modules/searching/searching.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly videoService: VideoService,
    private readonly searchingService: SearchingService,
  ) {}

  async onModuleInit() {
    //await this.handleEmbeddingCron();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleUpdateSearchingStatMonthCount() {
    const prefixLog = `[handleUpdateSearchingStatMonthCount] `;
    this.logger.log(`${prefixLog} start`);

    const updated = await this.searchingService.updateSearchingStatMonthCount();
    this.logger.log(`${prefixLog} updated ${updated} keyword(s) monthCount`);
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
