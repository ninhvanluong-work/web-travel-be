import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';

import { Product } from 'src/modules/product/entities/product.entity';
import { Tag } from 'src/modules/product/entities/tag.entity';
import { ProductTourGuide } from 'src/modules/product/entities/product-tour-guide.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

import { Video } from 'src/modules/video/entities/video.entity';
import { Itinerary } from 'src/modules/Itinerary/entities/itinerary.entity';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';
import { ReviewModule } from 'src/modules/review/review.module';
import { ElementModule } from 'src/modules/element/element.module';
import { OptionModule } from 'src/modules/option/option.module';
import { DepartureTimeModule } from 'src/modules/departure-time/departure-time.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Tag,
      ProductTourGuide,
      TourGuide,
      Destination,
      Supplier,
      Video,
      Itinerary,
      PickupLocation,
      Unit,
    ]),
    ReviewModule,
    ElementModule,
    OptionModule,
    DepartureTimeModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
