import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import {
  Booking,
  BookingStatus,
} from 'src/modules/booking/entities/booking.entity';
import {
  BookingPayment,
  BookingPaymentStatus,
} from 'src/modules/booking/entities/booking-payment.entity';
import { PaypalService } from 'src/modules/payment/paypal.service';

@Injectable()
export class PaymentService {
  private logger = new Logger(PaymentService.name);

  private prefix(context: string, id?: string): string {
    return `[PaymentService:${context}]${id ? ' ' + id : ''}`;
  }

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingPayment)
    private readonly bookingPaymentRepository: Repository<BookingPayment>,
    private readonly paypalService: PaypalService,
    private readonly configService: ConfigService,
  ) {}

  private async getPayableBooking(
    userId: string,
    bookingId: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Booking ${booking.bookingCode} is not payable (status: ${booking.status})`,
      );
    }
    return booking;
  }

  async createPaypalOrder(userId: string, bookingId: string) {
    const prefix = this.prefix('createPaypalOrder', bookingId);
    const booking = await this.getPayableBooking(userId, bookingId);

    const currency = this.configService.get<string>('PAYPAL_CURRENCY') || 'USD';

    const order = await this.paypalService.createOrder({
      bookingCode: booking.bookingCode,
      amount: Number(booking.totalPrice),
      currency,
    });

    const payment = this.bookingPaymentRepository.create({
      booking,
      provider: 'paypal',
      providerIntentId: order.id,
      price: booking.totalPrice,
      currency,
      status: BookingPaymentStatus.PENDING,
      rawResponse: order,
    });
    await this.bookingPaymentRepository.save(payment);

    const approveUrl = order.links.find((link) => link.rel === 'approve')?.href;

    this.logger.log(`${prefix} orderId=${order.id}`);

    return {
      orderId: order.id,
      approveUrl,
      status: order.status,
    };
  }

  async capturePaypalOrder(userId: string, bookingId: string, orderId: string) {
    const prefix = this.prefix('capturePaypalOrder', bookingId);
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const payment = await this.bookingPaymentRepository.findOne({
      where: { providerIntentId: orderId, booking: { id: bookingId } },
      relations: ['booking'],
    });
    if (!payment) {
      throw new NotFoundException('Payment order not found for this booking');
    }

    if (payment.status === BookingPaymentStatus.SUCCEED) {
      this.logger.log(`${prefix} orderId=${orderId} already succeeded`);
      return { booking, payment };
    }

    const capture = await this.paypalService.captureOrder(orderId);
    const captureDetail = capture.purchase_units?.[0]?.payments?.captures?.[0];

    if (capture.status === 'COMPLETED' && captureDetail) {
      await this.markPaymentSucceeded(payment, captureDetail.id, capture);
      this.logger.log(`${prefix} orderId=${orderId} captured successfully`);
    } else {
      await this.markPaymentFailed(
        payment,
        `Paypal capture status: ${capture.status}`,
        capture,
      );
      this.logger.warn(`${prefix} orderId=${orderId} capture not completed`);
      throw new BadRequestException('Payment capture failed');
    }

    const updatedBooking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    return { booking: updatedBooking, payment };
  }

  async markPaymentSucceededByOrderId(
    orderId: string,
    providerTxId: string,
    rawResponse: Record<string, any>,
  ): Promise<void> {
    const payment = await this.bookingPaymentRepository.findOne({
      where: { providerIntentId: orderId },
      relations: ['booking'],
    });
    if (!payment) {
      this.logger.warn(
        `[markPaymentSucceededByOrderId] no payment found for orderId=${orderId}`,
      );
      return;
    }
    if (payment.status === BookingPaymentStatus.SUCCEED) {
      return;
    }
    await this.markPaymentSucceeded(payment, providerTxId, rawResponse);
  }

  private async markPaymentSucceeded(
    payment: BookingPayment,
    providerTxId: string,
    rawResponse: Record<string, any>,
  ): Promise<void> {
    payment.status = BookingPaymentStatus.SUCCEED;
    payment.providerTxId = providerTxId;
    payment.rawResponse = rawResponse;
    await this.bookingPaymentRepository.save(payment);

    await this.bookingRepository.update(payment.booking.id, {
      status: BookingStatus.PAID,
    });
  }

  private async markPaymentFailed(
    payment: BookingPayment,
    reason: string,
    rawResponse: Record<string, any>,
  ): Promise<void> {
    payment.status = BookingPaymentStatus.FAILED;
    payment.failureReason = reason;
    payment.rawResponse = rawResponse;
    await this.bookingPaymentRepository.save(payment);
  }

  getPaypalPublicConfig() {
    return {
      clientId: this.configService.get<string>('PAYPAL_CLIENT_ID'),
      currency: this.configService.get<string>('PAYPAL_CURRENCY') || 'USD',
    };
  }

  async createDemoOrder(amount: number) {
    const currency =
      this.configService.get<string>('PAYPAL_CURRENCY') || 'USD';
    const order = await this.paypalService.createOrder({
      bookingCode: `DEMO-${Date.now()}`,
      amount,
      currency,
    });
    return { orderId: order.id, status: order.status };
  }

  async captureDemoOrder(orderId: string) {
    const capture = await this.paypalService.captureOrder(orderId);
    const captureDetail = capture.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      orderId: capture.id,
      status: capture.status,
      captureId: captureDetail?.id,
    };
  }
}
