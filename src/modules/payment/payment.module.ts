import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from 'src/modules/booking/entities/booking.entity';
import { BookingPayment } from 'src/modules/booking/entities/booking-payment.entity';
import { BookingPaymentHistory } from 'src/modules/booking/entities/booking-payment-history.entity';

import { PaymentController } from './payment.controller';
import { VnpayPaymentController } from './vnpay-payment.controller';
import { PaymentService } from './payment.service';
import { PaypalService } from './paypal.service';
import { VnpayService } from './vnpay.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Booking, BookingPayment, BookingPaymentHistory]),
  ],
  controllers: [PaymentController, VnpayPaymentController],
  providers: [PaymentService, PaypalService, VnpayService],
  exports: [PaymentService, PaypalService, VnpayService],
})
export class PaymentModule {}
