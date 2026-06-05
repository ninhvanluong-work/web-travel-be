import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToMany } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { CareerPathItemDto } from 'src/modules/tour-guide/dto/create-tour-guide.dto';
import { RatingItemDto } from 'src/modules/tour-guide/dto/review-rating.dto';

export class UserReview {
  reviewCount: number;
  reviewValue: number;
  ratings: RatingItemDto[];
}

const userReviewDefault = {
  reviewCount: 0,
  reviewValue: 0,
  ratings: [
    { key: 'storytelling', name: 'Storytelling', value: 0 },
    { key: 'localKnowledge', name: 'Local knowledge', value: 0 },
    { key: 'careAttention', name: 'Care & attention', value: 0 },
    { key: 'safetyAwareness', name: 'Safety awareness', value: 0 },
    { key: 'punctuality', name: 'Punctuality', value: 0 },
    { key: 'english', name: 'English', value: 0 },
    {
      key: 'funny',
      name: 'funny',
      value: 0,
    },
  ],
};

export class SupplierReviewItem {
  id: string;
  name: string;
  tourName: string;
  point: number;
  content: string;
  createdAt: Date;
}

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

  @ApiProperty({
    example:
      'Bố tôi là người Tày ở Lào Cai, mẹ tôi là người Hà Nội. Tôi lớn lên giữa hai thế giới — phố cổ và rừng núi — và mỗi tour của tôi là một cách để chia sẻ cả hai. Sau bảy năm dẫn khách, tôi vẫn xúc động khi thấy ai đó nhìn ruộng bậc thang lần đầu tiên.',
    nullable: true,
  })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @ApiProperty({ example: ['EN', 'VN', 'FR'], nullable: true })
  @Column({ type: 'varchar', array: true, length: 50, nullable: true })
  languages: string[];

  @ApiProperty({
    example: ['Cultural tours', 'Trekking', 'Food tours'],
    nullable: true,
  })
  @Column({ type: 'varchar', array: true, length: 100, nullable: true })
  experts: string[];

  @ApiProperty({
    type: [SupplierReviewItem],
    example: [
      {
        id: 'uuid',
        name: 'Nguyễn Văn B',
        createdAt: '2024-01-01T00:00:00.000Z',
        content: 'Hướng dẫn viên rất nhiệt tình',
        point: 5,
        tourName: 'Tour Hà Nội - Sapa',
      },
    ],
    nullable: true,
  })
  @Column({ type: 'jsonb', name: 'supplier_review', nullable: true })
  supplierReview: SupplierReviewItem[];

  @ApiProperty({
    type: UserReview,
    example: {
      reviewCount: 200,
      reviewValue: 4.5,
      ratings: [
        { key: 'storytelling', name: 'Storytelling', value: 4.92 },
        { key: 'localKnowledge', name: 'Local knowledge', value: 4.95 },
        { key: 'careAttention', name: 'Care & attention', value: 4.85 },
        { key: 'safetyAwareness', name: 'Safety awareness', value: 4.9 },
        { key: 'punctuality', name: 'Punctuality', value: 4.82 },
        { key: 'english', name: 'English', value: 4.78 },
        {
          key: 'funny',
          name: 'Hải hước & vui vẻ',
          value: 4.71,
        },
      ],
    },
    nullable: true,
  })
  @Column({
    type: 'jsonb',
    name: 'user_review',
    nullable: true,
    default: userReviewDefault,
  })
  userReview: UserReview;

  @ApiProperty({
    example: { current: 'Senior Guide', yearsInRole: 5 },
    nullable: true,
  })
  @Column({ type: 'jsonb', name: 'career_path', nullable: true })
  careerPath: CareerPathItemDto[];

  @ManyToMany(() => Product, (product: Product) => product.tourGuides)
  products: Product[];
}
