import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { SessionUnit } from 'src/modules/session-unit/entities/session-unit.entity';

export enum SessionStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

@Entity('session')
export class Session extends BaseEntity {
  @Column({ name: 'product_id', nullable: true })
  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  productId: string;

  @Column({ name: 'travel_date', type: 'timestamptz', nullable: true })
  @ApiProperty()
  travelDate: Date;

  @Column({ name: 'capacity', type: 'int', default: 0 })
  @ApiProperty({ description: 'số khả dụng cho phép book', default: 0 })
  capacity: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: SessionStatus.INACTIVE,
  })
  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ManyToOne(() => Product, (product) => product.sessions)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_Session_Product',
  })
  product: Product;

  @OneToMany(() => SessionUnit, (sessionUnit) => sessionUnit.session)
  sessionUnits: SessionUnit[];
}
