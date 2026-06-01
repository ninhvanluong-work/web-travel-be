import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { Video } from 'src/modules/video/entities/video.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { Itinerary } from 'src/modules/Itinerary/entities/itinerary.entity';
import { Tag } from 'src/modules/product/entities/tag.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { Element } from 'src/modules/element/entities/element.entity';
import { HeroVideoDto } from 'src/modules/product/dto/product-detail.dto';

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

export class BannerItem {
  @ApiProperty({ example: 'image', enum: ['image', 'video'] })
  type: 'image' | 'video';

  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  url: string;
}

export class ReadBefore {
  @ApiProperty({ example: 'passport' })
  key: string;

  @ApiProperty({ example: 'Passport Required' })
  title: string;

  @ApiProperty({
    example: 'You need a valid passport to enter the country',
  })
  description: string;
}

export class ExperienceItem {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiProperty({ example: 'Experience title' })
  title: string;

  @ApiProperty({ example: 'Detailed content about this experience' })
  content: string;
}
@Entity('product')
export class Product extends BaseEntity {
  @ApiProperty({ example: 'Hạ Long Bay Tour' })
  @Column({ length: 500 })
  name: string;

  @ApiProperty({ example: 'Detailed description of the tour...' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'Short description of the tour...' })
  @Column({ type: 'text', name: 'short_description', nullable: true })
  shortDescription: string;

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

  @Column({
    type: 'jsonb',
    default: [],
    comment: 'array of media banner ex: [{type: image, url: "...."]',
  })
  @ApiProperty({ type: 'array' })
  banner: BannerItem[];

  @Column({
    type: 'jsonb',
    default: [],
    comment: 'array of read before ex: [{key: " }]',
  })
  @ApiProperty({ type: 'array' })
  readBefore: ReadBefore[];

  @Column({
    type: 'jsonb',
    default: [],
    comment:
      'array of experience items ex: [{image_url: "...", title: "...", content: "..."}]',
  })
  @ApiProperty({ type: 'array' })
  experience: ExperienceItem[];

  @ApiProperty({ example: 'https://example.com/itinerary.jpg' })
  @Column({ nullable: true, name: 'itinerary_image' })
  itineraryImage: string;

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

  @ApiProperty({ example: 300 })
  @Column({ type: 'int', name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ type: 'uuid', name: 'destination_id' })
  destinationId: string;

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string;

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

  @OneToMany(() => Review, (review: Review) => review.product)
  reviews: Review[];

  @OneToMany(() => Itinerary, (itinerary: Itinerary) => itinerary.product, {
    cascade: true,
  })
  itineraries: Itinerary[];

  heroVideo?: HeroVideoDto;

  @ApiProperty({ type: () => [Tag], nullable: true })
  @ManyToMany(() => Tag, (tag: Tag) => tag.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_tag',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @ApiProperty({ type: () => [Element], nullable: true })
  @ManyToMany(() => Element, (element: Element) => element.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_element',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'element_id',
      referencedColumnName: 'id',
    },
  })
  elements: Element[];

  @ApiProperty({ type: () => [TourGuide], nullable: true })
  @ManyToMany(() => TourGuide, (guide: TourGuide) => guide.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_tour_guide',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tour_guide_id',
      referencedColumnName: 'id',
    },
  })
  tourGuides: TourGuide[];
}
