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
import { BookingPaymentHistory } from 'src/modules/booking/entities/booking-payment-history.entity';
import { PaypalService } from 'src/modules/payment/paypal.service';
import { VnpayService } from 'src/modules/payment/vnpay.service';
import {
  VnpayCallbackQuery,
  VnpayCallbackResult,
} from 'src/modules/payment/types/vnpay.type';
import { generateRandomCode } from 'src/common/utils/gen-code';
import { SupplierPaymentMethod } from 'src/modules/supplier/entities/supplier-payment.entity';

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
    @InjectRepository(BookingPaymentHistory)
    private readonly bookingPaymentHistoryRepository: Repository<BookingPaymentHistory>,
    private readonly paypalService: PaypalService,
    private readonly vnpayService: VnpayService,
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

    const currency =
      booking.currency ||
      this.configService.get<string>('PAYPAL_CURRENCY') ||
      'USD';

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
      await this.markPaymentSucceeded(
        payment,
        captureDetail.id,
        capture,
        'paypal_capture',
      );
      this.logger.log(`${prefix} orderId=${orderId} captured successfully`);
    } else {
      await this.markPaymentFailed(
        payment,
        `Paypal capture status: ${capture.status}`,
        capture,
        'paypal_capture',
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
    await this.markPaymentSucceeded(
      payment,
      providerTxId,
      rawResponse,
      'paypal_webhook',
    );
  }

  async markPaymentFailedByIntentId(
    intentId: string,
    reason: string,
    rawResponse: Record<string, any>,
  ): Promise<void> {
    const payment = await this.bookingPaymentRepository.findOne({
      where: { providerIntentId: intentId },
      relations: ['booking'],
    });
    if (!payment) {
      this.logger.warn(
        `[markPaymentFailedByIntentId] no payment found for intentId=${intentId}`,
      );
      return;
    }
    if (payment.status !== BookingPaymentStatus.PENDING) {
      return;
    }
    await this.markPaymentFailed(
      payment,
      reason,
      rawResponse,
      'paypal_webhook',
    );
  }

  async createVnpayPaymentUrl(
    userId: string,
    bookingId: string,
    ipAddr: string,
  ) {
    const prefix = this.prefix('createVnpayPaymentUrl', bookingId);

    const booking = await this.getPayableBooking(userId, bookingId);

    const txnRef = generateRandomCode(12);
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      txnRef,
      amount: Number(booking.totalPrice),
      orderInfo: `Thanh toan booking ${booking.bookingCode}`,
      ipAddr,
    });

    const payment = this.bookingPaymentRepository.create({
      bookingId: booking.id,
      provider: SupplierPaymentMethod.VNPAY,
      providerIntentId: txnRef,
      price: booking.totalPrice,
      currency: booking.currency || 'VND',
      status: BookingPaymentStatus.PENDING,
    });
    await this.bookingPaymentRepository.save(payment);

    this.logger.log(`${prefix} txnRef=${txnRef}`);

    return { txnRef, paymentUrl };
  }

  async handleVnpayCallback(
    query: VnpayCallbackQuery,
  ): Promise<VnpayCallbackResult> {
    const result = this.vnpayService.verifyCallback(query);
    const prefix = this.prefix('handleVnpayCallback', result.txnRef);

    if (!result.isValid || !result.txnRef) {
      this.logger.warn(`${prefix} invalid signature`);
      return {
        ...result,
        isValid: false,
        paymentFound: false,
        amountMatches: false,
      };
    }

    const payment = await this.bookingPaymentRepository.findOne({
      where: { providerIntentId: result.txnRef },
      relations: ['booking'],
    });

    if (!payment) {
      this.logger.warn(`${prefix} no payment found`);
      return { ...result, paymentFound: false, amountMatches: false };
    }

    const bookingId = payment.booking.id;

    if (payment.status !== BookingPaymentStatus.PENDING) {
      this.logger.log(`${prefix} already processed (status=${payment.status})`);
      return { ...result, paymentFound: true, amountMatches: true, bookingId };
    }

    const amountMatches = Number(payment.price) === result.amount;
    if (!amountMatches) {
      this.logger.warn(
        `${prefix} amount mismatch expected=${payment.price} actual=${result.amount}`,
      );
      await this.markPaymentFailed(
        payment,
        'Amount mismatch',
        query,
        'vnpay_callback',
      );
      return {
        ...result,
        isSuccess: false,
        paymentFound: true,
        amountMatches: false,
        bookingId,
      };
    }

    if (result.isSuccess && result.transactionNo) {
      await this.markPaymentSucceeded(
        payment,
        result.transactionNo,
        query,
        'vnpay_callback',
      );
      this.logger.log(`${prefix} marked as succeeded`);
    } else {
      await this.markPaymentFailed(
        payment,
        `Vnpay responseCode: ${result.responseCode}`,
        query,
        'vnpay_callback',
      );
      this.logger.warn(`${prefix} marked as failed`);
    }

    return { ...result, paymentFound: true, amountMatches: true, bookingId };
  }

  buildVnpayReturnRedirectUrl(result: VnpayCallbackResult): string {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
    ) as string;
    const redirectUrl = new URL('/payment/vnpay/return', frontendUrl);

    const status =
      result.isValid &&
      result.paymentFound &&
      result.amountMatches &&
      result.isSuccess
        ? 'success'
        : 'failed';
    redirectUrl.searchParams.set('status', status);

    if (result.txnRef) {
      redirectUrl.searchParams.set('txnRef', result.txnRef);
    }
    if (result.bookingId) {
      redirectUrl.searchParams.set('bookingId', result.bookingId);
    }
    if (result.amount !== undefined) {
      redirectUrl.searchParams.set('amount', String(result.amount));
    }

    if (status === 'failed') {
      redirectUrl.searchParams.set('reason', this.vnpayFailureReason(result));
    }

    return redirectUrl.toString();
  }

  private vnpayFailureReason(result: VnpayCallbackResult): string {
    if (!result.isValid) return 'invalid_signature';
    if (!result.paymentFound) return 'order_not_found';
    if (!result.amountMatches) return 'amount_mismatch';
    return 'declined';
  }

  private async markPaymentSucceeded(
    payment: BookingPayment,
    providerTxId: string,
    rawResponse: Record<string, any>,
    source: string,
  ): Promise<void> {
    const fromStatus = payment.status;
    payment.status = BookingPaymentStatus.SUCCEED;
    payment.providerTxId = providerTxId;
    payment.rawResponse = rawResponse;
    await this.bookingPaymentRepository.save(payment);

    await this.bookingRepository.update(payment.booking.id, {
      status: BookingStatus.PAID,
    });

    await this.recordStatusHistory(
      payment,
      fromStatus,
      BookingPaymentStatus.SUCCEED,
      { rawResponse, source },
    );
  }

  private async markPaymentFailed(
    payment: BookingPayment,
    reason: string,
    rawResponse: Record<string, any>,
    source: string,
  ): Promise<void> {
    const fromStatus = payment.status;
    payment.status = BookingPaymentStatus.FAILED;
    payment.failureReason = reason;
    payment.rawResponse = rawResponse;
    await this.bookingPaymentRepository.save(payment);

    await this.recordStatusHistory(
      payment,
      fromStatus,
      BookingPaymentStatus.FAILED,
      { reason, rawResponse, source },
    );
  }

  private async recordStatusHistory(
    payment: BookingPayment,
    fromStatus: BookingPaymentStatus | null,
    toStatus: BookingPaymentStatus,
    options: {
      reason?: string;
      rawResponse?: Record<string, any>;
      source: string;
    },
  ): Promise<void> {
    const history = this.bookingPaymentHistoryRepository.create({
      bookingPaymentId: payment.id,
      bookingId: payment.bookingId ?? payment.booking?.id,
      fromStatus,
      toStatus,
      provider: payment.provider,
      providerTxId: payment.providerTxId,
      reason: options.reason,
      rawResponse: options.rawResponse,
      source: options.source,
    });
    await this.bookingPaymentHistoryRepository.save(history);
  }

  getPaypalPublicConfig() {
    return {
      clientId: this.configService.get<string>('PAYPAL_CLIENT_ID'),
      currency: this.configService.get<string>('PAYPAL_CURRENCY') || 'USD',
    };
  }

  async createDemoOrder(amount: number) {
    const currency = this.configService.get<string>('PAYPAL_CURRENCY') || 'USD';
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
