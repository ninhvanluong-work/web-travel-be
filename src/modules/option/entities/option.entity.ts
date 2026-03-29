import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('option')
export class Option extends BaseEntity {
  @Column({ length: 500 })
  @ApiProperty({ example: 'product title' })
  title: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'product description' })
  description: string;

  @Column({ type: 'int', name: 'adult_price', nullable: true, default: 0 })
  @ApiProperty({})
  adultPrice: number;

  @Column({ type: 'int', name: 'child_price', nullable: true, default: 0 })
  @ApiProperty({})
  childPrice: number;

  @Column({ type: 'int', name: 'infant_price', nullable: true, default: 0 })
  @ApiProperty({})
  infantPrice: number;

  @Column({ name: 'currency', nullable: true, default: 'VND' })
  @ApiProperty({ example: 'VND' })
  currency: string;

  @ManyToOne(() => Product, (product) => product.options)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_Option_Product',
  })
  product: Product;
}
