import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { SearchingLog } from 'src/modules/searching/entities/searching-log.entity';

@Entity('user')
export class User extends BaseEntity {
  @Column({ name: 'ip_address', length: 255, nullable: true })
  ipAddress: string;

  @Column({ unique: true, nullable: true, length: 255 })
  email?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => SearchingLog, (searching) => searching.user)
  searchingLogs: SearchingLog[];
}
