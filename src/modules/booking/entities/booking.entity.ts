import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';

export enum BookingStatus {
  PAID = 'paid',
  PENDING = 'pending',
  CANCEL = 'cancel',
}

@Entity('bookings')
export class Booking extends BaseEntity {
  @Column({ name: 'booking_date', type: 'timestamptz' })
  bookingDate: Date;

  @Column({ name: 'travel_date', type: 'timestamptz' })
  travelDate: Date;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column()
  email: string;

  @Column()
  phone: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.bookings)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
