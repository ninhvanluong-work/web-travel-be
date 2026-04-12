import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { EmbeddingModule } from 'src/modules/embedding/embedding.module';

import { Video } from 'src/modules/video/entities/video.entity';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from 'src/modules/product/product.module';

import { Product } from 'src/modules/product/entities/product.entity';
import { VideoEditorService } from 'src/modules/video/video-editor.service';
import { UploadModule } from 'src/modules/upload/upload.module';
import { ProductService } from 'src/modules/product/product.service';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { Itinerary } from 'src/modules/Itinerary/entities/itinerary.entity';
@Module({
  controllers: [VideoController],
  imports: [
    TypeOrmModule.forFeature([
      Video,
      Product,
      Destination,
      Supplier,
      Itinerary,
    ]),
    EmbeddingModule,
    ConfigModule,
    forwardRef(() => ProductModule),
    UploadModule,
  ],
  providers: [VideoService, VideoEditorService, ProductService],
  exports: [VideoService, VideoEditorService],
})
export class VideoModule {}
