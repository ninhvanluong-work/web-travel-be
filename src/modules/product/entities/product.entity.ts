import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { Video } from 'src/modules/video/entities/video.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Option } from 'src/modules/option/entities/option.entity';

@Entity('product')
export class Product extends BaseEntity {
  @Column({ length: 500 })
  @ApiProperty({ example: 'product title' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'product description' })
  description: string;

  @ManyToOne(() => Destination, (dest: Destination) => dest.products)
  @JoinColumn({
    name: 'destination_id',
    foreignKeyConstraintName: 'FK_Product_Destination',
  })
  destination: Destination;

  @ManyToOne(() => Supplier, (sup: Supplier) => sup.products)
  @JoinColumn({
    name: 'supplier_id',
    foreignKeyConstraintName: 'FK_Product_Supplier',
  })
  supplier: Supplier;

  @OneToMany(() => Video, (video) => video.product)
  videos: Video[];

  @OneToMany(() => Booking, (booking: Booking) => booking.product)
  bookings: Booking[];

  @OneToMany(() => Option, (option: Option) => option.product)
  options: Option[];
}
