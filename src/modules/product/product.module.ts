import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';

import { Product } from 'src/modules/product/entities/product.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

import { Video } from 'src/modules/video/entities/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Destination, Supplier, Video])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
