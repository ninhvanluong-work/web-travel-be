import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DepartureTime } from './entities/departure-time.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { DepartureTimeService } from './departure-time.service';
import { DepartureTimeController } from './departure-time.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DepartureTime, Option])],
  providers: [DepartureTimeService],
  controllers: [DepartureTimeController],
  exports: [DepartureTimeService],
})
export class DepartureTimeModule {}
