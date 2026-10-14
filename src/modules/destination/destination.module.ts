import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Product } from 'src/modules/product/entities/product.entity';

import { DestinationService } from './destination.service';
import { DestinationController } from './destination.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Destination, Product])],
  controllers: [DestinationController],
  providers: [DestinationService],
  exports: [DestinationService],
})
export class DestinationModule {}
