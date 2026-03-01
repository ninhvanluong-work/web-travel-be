import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { EmbeddingModule } from 'src/embedding/embedding.module';

import { Video } from 'src/modules/video/entities/video.entity';

@Module({
  controllers: [VideoController],
  imports: [TypeOrmModule.forFeature([Video]), EmbeddingModule],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
