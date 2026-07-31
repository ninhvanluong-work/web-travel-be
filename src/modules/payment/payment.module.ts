import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from 'src/modules/booking/entities/booking.entity';
import { BookingPayment } from 'src/modules/booking/entities/booking-payment.entity';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaypalService } from './paypal.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Booking, BookingPayment]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaypalService],
  exports: [PaymentService, PaypalService],
})
export class PaymentModule {}
