import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('review')
export class Review extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'comment' })
  comment: string;

  @Column({ type: 'float', nullable: true, default: 5 })
  @ApiProperty({})
  point: number;

  @Column({ name: 'currency', nullable: true, default: 'VND' })
  @ApiProperty({ example: 'VND' })
  currency: string;

  @Column({ name: 'product_id' })
  @ApiProperty({})
  productId: string;

  @ManyToOne(() => Product, (product) => product.reviews)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_Review_Product',
  })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_Review_User',
  })
  user: User;
}
