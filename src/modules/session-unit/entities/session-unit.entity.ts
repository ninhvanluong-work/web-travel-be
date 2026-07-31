import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';

@Entity('session_unit')
@Unique('UQ_SessionUnit_Session_Unit', ['sessionId', 'unitId'])
export class SessionUnit extends BaseEntity {
  @Column({ type: 'uuid', name: 'session_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  sessionId: string;

  @Column({ type: 'uuid', name: 'unit_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  unitId: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @ApiProperty({ description: 'giá của unit trong session này', default: 0 })
  price: number;

  @ManyToOne(() => Session, (session) => session.sessionUnits)
  @JoinColumn({
    name: 'session_id',
    foreignKeyConstraintName: 'FK_SessionUnit_Session',
  })
  session: Session;

  @ManyToOne(() => Unit, (unit) => unit.sessionUnits)
  @JoinColumn({
    name: 'unit_id',
    foreignKeyConstraintName: 'FK_SessionUnit_Unit',
  })
  unit: Unit;
}
