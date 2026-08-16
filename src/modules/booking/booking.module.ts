import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from 'src/modules/booking/entities/booking.entity';
import { BookingPayment } from 'src/modules/booking/entities/booking-payment.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';
import { SessionUnit } from 'src/modules/session-unit/entities/session-unit.entity';
import { DepartureTime } from 'src/modules/departure-time/entities/departure-time.entity';

import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingPayment,
      Product,
      Option,
      Session,
      PickupLocation,
      Unit,
      SessionUnit,
      DepartureTime,
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
