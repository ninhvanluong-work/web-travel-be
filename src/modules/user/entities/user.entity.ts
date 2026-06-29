import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { SearchingLog } from 'src/modules/searching/entities/searching-log.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';

export enum UserRole {
  NORMAL = 'normal',
  TOUR_GUIDE = 'tour_guide',
}

@Entity('user')
export class User extends BaseEntity {
  @Column({ name: 'name', length: 255, nullable: true })
  name: string;

  @Column({
    name: 'role',
    length: 50,
    default: UserRole.NORMAL,
    nullable: true,
  })
  role: UserRole;

  @Column({ name: 'ip_address', length: 255, nullable: true })
  ipAddress: string;

  @Column({ unique: true, nullable: true, length: 255 })
  email?: string;

  @Column({ length: 500, nullable: true })
  @Exclude()
  password: string;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  @Exclude()
  refreshToken: string;

  @Column({
    name: 'reset_password_token',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  @Exclude()
  resetPasswordToken?: string | null = null;

  @Column({
    name: 'reset_password_token_exp',
    type: 'timestamptz',
    nullable: true,
  })
  @Exclude()
  resetPasswordTokenExp?: Date | null = null;

  @Column({ name: 'tour_guide_id', type: 'uuid', nullable: true })
  tourGuideId: string;

  @OneToOne(() => TourGuide, (tourGuide) => tourGuide.user)
  @JoinColumn({
    name: 'tour_guide_id',
    foreignKeyConstraintName: 'FK_User_Tour_Guide',
  })
  tourGuide: TourGuide;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => SearchingLog, (searching) => searching.user)
  searchingLogs: SearchingLog[];
}
