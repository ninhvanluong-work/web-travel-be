import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { EmbeddingModule } from 'src/embedding/embedding.module';

import { Video } from 'src/modules/video/entities/video.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [VideoController],
  imports: [TypeOrmModule.forFeature([Video]), EmbeddingModule, ConfigModule],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
