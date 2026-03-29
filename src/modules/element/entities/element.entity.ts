import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';

import { ApiProperty } from '@nestjs/swagger';

export enum OwnerType {
  PRODUCT = 'product',
  OPTION = 'option',
}

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

  @ApiProperty({
    example: 'uuid-of-product-or-option',
    description: 'ID record (Product or Option)',
  })
  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string;

  @ApiProperty({
    enum: OwnerType,
    example: OwnerType.PRODUCT,
  })
  @Column({
    name: 'owner_type',
    nullable: true,
    length: '50',
  })
  ownerType: OwnerType;
}
