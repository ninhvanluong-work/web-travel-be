import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { VideoModule } from 'src/modules/video/video.module';

@Module({
  imports: [ConfigModule, VideoModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
