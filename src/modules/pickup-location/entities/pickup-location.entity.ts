import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('pickup_location')
export class PickupLocation extends BaseEntity {
  @Column({ name: 'product_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  productId: string;

  @Column({ length: 500 })
  @ApiProperty({ example: 'pickup location name' })
  name: string;

  @Column({ nullable: true, length: 500 })
  @ApiProperty({ nullable: true })
  address: string;

  @Column({ name: 'is_popular', type: 'boolean', default: false })
  @ApiProperty({ default: false })
  isPopular: boolean;

  @Column({ name: 'map_url', nullable: true, length: 500 })
  @ApiProperty({ nullable: true })
  mapUrl: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ default: 0 })
  order: number;

  @ManyToOne(() => Product)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_PickupLocation_Product',
  })
  product: Product;
}
