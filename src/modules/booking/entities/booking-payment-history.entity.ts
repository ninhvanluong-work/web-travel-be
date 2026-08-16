import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';
import {
  BookingPayment,
  BookingPaymentStatus,
} from 'src/modules/booking/entities/booking-payment.entity';

@Entity('booking_payment_history')
export class BookingPaymentHistory extends BaseEntity {
  @Column({ type: 'uuid', name: 'booking_payment_id' })
  bookingPaymentId: string;

  @Column({ type: 'uuid', name: 'booking_id', nullable: true })
  bookingId: string;

  @Column({ name: 'from_status', type: 'varchar', length: 50, nullable: true })
  fromStatus: BookingPaymentStatus | null;

  @Column({ name: 'to_status', type: 'varchar', length: 50 })
  toStatus: BookingPaymentStatus;

  @Column({ nullable: true, length: 100 })
  provider: string;

  @Column({ name: 'provider_tx_id', nullable: true, length: 255 })
  providerTxId: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse: Record<string, any>;

  @Column({ nullable: true, length: 50 })
  source: string;

  @ManyToOne(() => BookingPayment)
  @JoinColumn({
    name: 'booking_payment_id',
    foreignKeyConstraintName: 'Fk_BookingPaymentHistory_BookingPayment',
  })
  bookingPayment: BookingPayment;

  @ManyToOne(() => Booking)
  @JoinColumn({
    name: 'booking_id',
    foreignKeyConstraintName: 'Fk_BookingPaymentHistory_Booking',
  })
  booking: Booking;
}
