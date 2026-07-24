import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { TourSession } from 'src/modules/tour-session/entities/tour-session.entity';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { UnitReference } from 'src/modules/unit-reference/entities/unit-reference.entity';
import { DepartureTime } from 'src/modules/departure-time/entities/departure-time.entity';

import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Product,
      Option,
      TourSession,
      PickupLocation,
      UnitReference,
      DepartureTime,
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
