import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchingService } from './searching.service';
import { SearchingController } from './searching.controller';
import { SearchingLog } from './entities/searching-log.entity';
import { SearchingStat } from './entities/searching-stat.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SearchingLog,
      SearchingStat,
      Destination,
      Product,
    ]),
  ],
  controllers: [SearchingController],
  providers: [SearchingService],
  exports: [SearchingService],
})
export class SearchingModule {}
