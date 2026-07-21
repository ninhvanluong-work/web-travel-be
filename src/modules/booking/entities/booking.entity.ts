import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { TourSession } from 'src/modules/tour-session/entities/tour-session.entity';

export enum BookingStatus {
  PAID = 'paid',
  PENDING = 'pending',
  CANCEL = 'cancel',
}

@Entity('booking')
export class Booking extends BaseEntity {
  @Column({ name: 'booking_date', type: 'timestamptz', nullable: true })
  bookingDate: Date;

  @Column({ name: 'travel_date', type: 'timestamptz', nullable: true })
  travelDate: Date;

  @Column({ name: 'booking_code', nullable: true, length: 50, unique: true })
  bookingCode: string;

  //@Column({ name: 'option_id', type: 'uuid', nullable: true })
  //optionId: string;

  @Column({ name: 'tour_session_id', type: 'uuid', nullable: true })
  tourSessionId: string;

  @Column({ name: 'pickup_location_id', type: 'uuid', nullable: true })
  pickupLocationId: string;

  @Column({ name: 'adult_count', type: 'int', default: 0 })
  adultCount: number;

  @Column({ name: 'child_count', type: 'int', default: 0 })
  childCount: number;

  @Column({ name: 'infant_count', type: 'int', default: 0 })
  infantCount: number;

  @Column({
    name: 'adult_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  adultPrice: number;

  @Column({
    name: 'child_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  childPrice: number;

  @Column({
    name: 'infant_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  infantPrice: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @Column({
    type: 'varchar',
    default: BookingStatus.PENDING,
    length: 50,
  })
  status: BookingStatus;

  @Column({ nullable: true, length: 255 })
  email?: string;

  @Column({ nullable: true, length: 255 })
  phone?: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'Fk_Booking_User' })
  user: User;

  @ManyToOne(() => Product, (product) => product.bookings)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'Fk_Booking_Product',
  })
  product: Product;

  @ManyToOne(() => Option)
  @JoinColumn({
    name: 'option_id',
    foreignKeyConstraintName: 'Fk_Booking_Option',
  })
  option: Option;

  @ManyToOne(() => PickupLocation)
  @JoinColumn({
    name: 'pickup_location_id',
    foreignKeyConstraintName: 'Fk_Booking_PickupLocation',
  })
  pickupLocation: PickupLocation;

  @ManyToOne(() => TourSession)
  @JoinColumn({
    name: 'tour_session_id',
    foreignKeyConstraintName: 'Fk_Booking_TourSession',
  })
  tourSession: TourSession;
}
