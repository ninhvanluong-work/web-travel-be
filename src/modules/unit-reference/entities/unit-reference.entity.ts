import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { TourSession } from 'src/modules/tour-session/entities/tour-session.entity';

@Entity('unit_reference')
export class UnitReference extends BaseEntity {
  @Column({ name: 'tour_session_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  tourSessionId: string;

  @Column({ length: 255 })
  @ApiProperty({ example: 'unit name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ nullable: true })
  note: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @ApiProperty({ description: 'giá từng slot', default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'số lượng khách', default: 0 })
  capacity: number;

  @ManyToOne(() => TourSession)
  @JoinColumn({
    name: 'tour_session_id',
    foreignKeyConstraintName: 'FK_UnitReference_TourSession',
  })
  tourSession: TourSession;
}
