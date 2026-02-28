import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';

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

  @Column({ type: 'int', default: 1 })
  quantity: number;

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
}
