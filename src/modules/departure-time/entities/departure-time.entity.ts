import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('departure_time')
export class DepartureTime extends BaseEntity {
  @Column({ name: 'product_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  productId: string;

  @Column({ type: 'time' })
  @ApiProperty({ example: '07:30:00', description: 'giờ khởi hành' })
  time: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ nullable: true, example: 'Khởi hành sáng' })
  label: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ default: 0 })
  order: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ nullable: true })
  note: string;

  @ManyToOne(() => Product, (product) => product.departureTimes)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_DepartureTime_Product',
  })
  product: Product;
}
