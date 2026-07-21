import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';

export enum BookingPaymentStatus {
  PENDING = 'pending',
  SUCCEED = 'succeed',
  FAILED = 'failed',
}

@Entity('booking_payment')
export class BookingPayment extends BaseEntity {
  @Column({ nullable: true, length: 100 })
  provider: string;

  @Column({ name: 'provider_tx_id', nullable: true, length: 255 })
  providerTxId: string;

  @Column({ name: 'provider_intent_id', nullable: true, length: 255 })
  providerIntentId: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  price: number;

  @Column({ nullable: true, default: 'VND', length: 10 })
  currency: string;

  @Column({
    type: 'varchar',
    default: BookingPaymentStatus.PENDING,
    length: 50,
  })
  status: BookingPaymentStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse: Record<string, any>;

  @ManyToOne(() => Booking)
  @JoinColumn({
    name: 'booking_id',
    foreignKeyConstraintName: 'Fk_BookingPayment_Booking',
  })
  booking: Booking;
}
