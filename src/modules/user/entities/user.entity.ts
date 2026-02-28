import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';

@Entity('user')
export class User extends BaseEntity {
  @Column({ name: 'ip_address', length: 255, nullable: true })
  ipAddress: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}
