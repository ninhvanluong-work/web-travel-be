import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';

import { Product } from 'src/modules/product/entities/product.entity';
import { Tag } from 'src/modules/product/entities/tag.entity';
import { TourGuide } from 'src/modules/product/entities/tour-guide.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

import { Video } from 'src/modules/video/entities/video.entity';
import { Itinerary } from 'src/modules/Itinerary/entities/itinerary.entity';
import { ReviewModule } from 'src/modules/review/review.module';
import { ElementModule } from 'src/modules/element/element.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Tag,
      TourGuide,
      Destination,
      Supplier,
      Video,
      Itinerary,
    ]),
    ReviewModule,
    ElementModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
