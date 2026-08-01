import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { SessionUnit } from 'src/modules/session-unit/entities/session-unit.entity';

@Entity('unit')
export class Unit extends BaseEntity {
  @Column({ length: 255 })
  @ApiProperty({ example: 'unit name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ nullable: true })
  note: string;

  @OneToMany(() => SessionUnit, (sessionUnit) => sessionUnit.unit)
  sessionUnits: SessionUnit[];
}
