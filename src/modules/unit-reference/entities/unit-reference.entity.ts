import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';

@Entity('unit_reference')
export class UnitReference extends BaseEntity {
  @Column({ length: 255 })
  @ApiProperty({ example: 'unit key' })
  key: string;

  @Column({ length: 255 })
  @ApiProperty({ example: 'unit name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ nullable: true })
  note: string;
}
