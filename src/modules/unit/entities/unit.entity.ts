import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { SessionUnit } from 'src/modules/session-unit/entities/session-unit.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('unit')
export class Unit extends BaseEntity {
  @Column({ length: 255 })
  @ApiProperty({ example: 'unit name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ nullable: true })
  note: string;

  @Column({ type: 'uuid', name: 'product_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product: Product) => product.units)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_Unit_Product',
  })
  product: Product;

  @OneToMany(() => SessionUnit, (sessionUnit) => sessionUnit.unit)
  sessionUnits: SessionUnit[];
}
