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

  @ManyToOne(() => Product, (product) => product.options)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_Option_Product',
  })
  product: Product;
}
