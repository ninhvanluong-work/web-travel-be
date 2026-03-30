import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { EmbeddingModule } from 'src/modules/embedding/embedding.module';

import { Video } from 'src/modules/video/entities/video.entity';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from 'src/modules/product/product.module';
import { ProductService } from 'src/modules/product/product.service';
import { Product } from 'src/modules/product/entities/product.entity';

@Module({
  controllers: [VideoController],
  imports: [
    TypeOrmModule.forFeature([Video, Product]),
    EmbeddingModule,
    ConfigModule,
    ProductModule,
  ],
  providers: [VideoService, ProductService],
  exports: [VideoService],
})
export class VideoModule {}
