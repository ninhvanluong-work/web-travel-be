import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { Video } from 'src/modules/video/entities/video.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Option } from 'src/modules/option/entities/option.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}
@Entity('product')
export class Product extends BaseEntity {
  @ApiProperty({ example: 'Hạ Long Bay Tour' })
  @Column({ length: 500 })
  name: string;

  @ApiProperty({ example: 'Detailed description of the tour...' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'ha-long-bay-tour' })
  @Column({ unique: true, nullable: true })
  slug: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg' })
  @Column({ nullable: true })
  thumbnail: string;

  @ApiProperty({ example: 'PROD-001' })
  @Column({ nullable: true, length: 255 })
  code: string;

  @ApiProperty({
    example: ['img1.jpg', 'img2.jpg'],
    description: 'Array of image URLs',
  })
  @Column({ type: 'json', nullable: true })
  images: string[];

  @ApiProperty({ example: 'https://example.com/itinerary.jpg' })
  @Column({ nullable: true, name: 'itinerary_image' })
  itineraryImage: string;

  @ApiProperty({ example: 3 })
  @Column({ type: 'int', default: 1 })
  duration: number;

  @ApiProperty({ example: 'day', description: 'day, hour, etc.' })
  @Column({ nullable: true, name: 'duration_type', default: 'day' })
  durationType: string;

  @ApiProperty({ example: 'Visit cave, swimming...' })
  @Column({ type: 'text', nullable: true })
  highlight: string;

  @ApiProperty({ example: 'Lunch, Guide, Entrance fee' })
  @Column({ type: 'text', nullable: true })
  include: string;

  @ApiProperty({ example: 'Personal expenses, VAT' })
  @Column({ type: 'text', nullable: true })
  exclude: string;

  @ApiProperty({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @ApiProperty({ example: 1500000 })
  @Column({
    name: 'min_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  minPrice: number;

  @ApiProperty({ example: 4.5 })
  @Column({ type: 'float', name: 'review_point', default: 0 })
  reviewPoint: number;

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
