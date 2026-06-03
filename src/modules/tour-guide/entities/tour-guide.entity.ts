import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToMany } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { CareerPathItemDto } from 'src/modules/tour-guide/dto/create-tour-guide.dto';

@Entity('tour_guide')
export class TourGuide extends BaseEntity {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ example: 120 })
  @Column({ type: 'int', name: 'rating_count', default: 0 })
  ratingCount: number;

  @ApiProperty({ example: 5 })
  @Column({ type: 'int', name: 'exp_year', default: 0 })
  expYear: number;

  @ApiProperty({ example: 4.5 })
  @Column({ type: 'float', name: 'rating_value', default: 0 })
  ratingValue: number;

  @ApiProperty({
    example: 'Expert tour guide with passion for travel',
    nullable: true,
    maxLength: 500,
  })
  @Column({ nullable: true, length: 500 })
  quote: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg', nullable: true })
  @Column({ name: 'cover_img', nullable: true })
  coverImg: string;

  @ApiProperty({
    example: 'Experienced guide specializing in cultural tours',
    nullable: true,
  })
  @Column({ nullable: true, type: 'text' })
  summary: string;

  @ApiProperty({ example: ['EN', 'VN', 'FR'], nullable: true })
  @Column({ type: 'varchar', array: true, length: 50, nullable: true })
  languages: string[];

  @ApiProperty({
    example: { rating: 4, reviews: 150, comment: 'comment' },
    nullable: true,
  })
  @Column({ type: 'jsonb', name: 'supplier_review', nullable: true })
  supplierReview: Record<string, any>;

  @ApiProperty({ example: { rating: 4.5, reviews: 200 }, nullable: true })
  @Column({ type: 'jsonb', name: 'user_review', nullable: true })
  userReview: Record<string, any>;

  @ApiProperty({
    example: { current: 'Senior Guide', yearsInRole: 5 },
    nullable: true,
  })
  @Column({ type: 'jsonb', name: 'career_path', nullable: true })
  careerPath: CareerPathItemDto[];

  @ManyToMany(() => Product, (product: Product) => product.tourGuides)
  products: Product[];
}
