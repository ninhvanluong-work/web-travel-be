import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('itinerary')
export class Itinerary extends BaseEntity {
  @Column({})
  @ApiProperty({ example: 'itinerary title' })
  name: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ name: 'featured_name', example: 'day 1' })
  featuredName: string;

  @Column({ default: 1, type: 'int' })
  @ApiProperty({ type: 'integer', example: '1', default: '1' })
  order: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ type: 'string', example: 'description...' })
  description: string;

  @ManyToOne(() => Product, (product) => product.itineraries)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_Itinerary_Product',
  })
  product: Product;
}
