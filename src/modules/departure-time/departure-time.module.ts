import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DepartureTime } from './entities/departure-time.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { DepartureTimeService } from './departure-time.service';
import { DepartureTimeController } from './departure-time.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DepartureTime, Product])],
  providers: [DepartureTimeService],
  controllers: [DepartureTimeController],
  exports: [DepartureTimeService],
})
export class DepartureTimeModule {}
