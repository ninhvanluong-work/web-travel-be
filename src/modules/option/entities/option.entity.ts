import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';

export enum OptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('option')
export class Option extends BaseEntity {
  @Column({ length: 500 })
  @ApiProperty({ example: 'product title' })
  title: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'product description' })
  description: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  @ApiProperty({})
  day: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  @ApiProperty({})
  night: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  @ApiProperty({})
  isDefault: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    default: OptionStatus.ACTIVE,
  })
  @ApiProperty({ enum: OptionStatus })
  status: OptionStatus;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({})
  order: number;

  @Column({
    name: 'allow_unit',
    type: 'uuid',
    array: true,
    nullable: true,
    comment: 'array of unit id',
  })
  @ApiProperty({ isArray: true, type: 'string', nullable: true })
  allowUnit: string[];

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
