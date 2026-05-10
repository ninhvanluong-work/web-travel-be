import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToMany } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('tag')
export class Tag extends BaseEntity {
  @ApiProperty({ example: 'adventure' })
  @Column({ unique: true, length: 255 })
  name: string;

  @ManyToMany(() => Product, (product) => product.tags)
  products: Product[];
}
