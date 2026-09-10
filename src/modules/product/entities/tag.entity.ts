import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToMany } from 'typeorm';

import { AuditableEntity } from 'src/database/auditable.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('tag')
export class Tag extends AuditableEntity {
  @ApiProperty({ example: 'adventure' })
  @Column({ unique: true, length: 255 })
  name: string;

  @ManyToMany(() => Product, (product) => product.tags)
  products: Product[];
}
