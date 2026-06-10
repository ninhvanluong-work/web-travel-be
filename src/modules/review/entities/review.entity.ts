import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { RatingItemDto } from 'src/modules/tour-guide/dto/review-rating.dto';

export class ReviewMetaDataDto {
  @ApiProperty({})
  guide: RatingItemDto[];
}

@Entity('review')
export class Review extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'comment' })
  comment: string;

  @Column({ type: 'float', nullable: true, default: 5 })
  @ApiProperty({})
  point: number;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'images',
    array: true,
    nullable: true,
    comment: 'array of images url',
  })
  @ApiProperty({})
  images: string[];

  @Column({
    type: 'varchar',
    name: 'videos',
    array: true,
    nullable: true,
    comment: 'array of videos url',
  })
  @ApiProperty({ isArray: true, type: 'string', nullable: true })
  videos: string[];

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  @ApiProperty({ type: ReviewMetaDataDto, nullable: true })
  metadata: ReviewMetaDataDto;

  @Column({ name: 'product_id', nullable: true })
  @ApiProperty({})
  productId: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    nullable: true,
  })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_Review_Product',
  })
  product: Product;

  @Column({ name: 'tour_guide_id', nullable: true })
  @ApiProperty({})
  tourGuideId: string;

  @ManyToOne(() => TourGuide, {
    nullable: true,
  })
  @JoinColumn({
    name: 'tour_guide_id',
    foreignKeyConstraintName: 'FK_Review_TourGuide',
  })
  tourGuide: TourGuide;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_Review_User',
  })
  user: User;
}
