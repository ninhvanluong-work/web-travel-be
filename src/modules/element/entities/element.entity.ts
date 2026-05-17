import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('element')
export class Element extends BaseEntity {
  @ApiProperty({ example: 'key_01', description: 'Unique key of the element' })
  @Column({ length: 255 })
  key: string;

  @ApiProperty({ example: 'Main Element', description: 'Name of the element' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ example: 'Detailed description...', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 1, description: 'Sorting order' })
  @Column({ type: 'int', default: 0 })
  order: number;

  @ApiProperty({ example: true, description: 'Activation status' })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ type: () => [Product], nullable: true })
  @ManyToMany(() => Product, (product: Product) => product.elements)
  products: Product[];
}
