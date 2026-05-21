import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToMany } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';

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
  @Column({ type: 'float', name: 'rating_star', default: 0 })
  ratingStar: number;

  @ManyToMany(() => Product, (product: Product) => product.tourGuides)
  products: Product[];
}
