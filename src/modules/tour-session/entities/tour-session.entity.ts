import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { UnitReference } from 'src/modules/unit-reference/entities/unit-reference.entity';

export enum TourSessionStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

@Entity('tour_session')
export class TourSession extends BaseEntity {
  @Column({ name: 'option_id', nullable: true })
  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  optionId: string;

  @Column({ name: 'travel_date', type: 'timestamptz', nullable: true })
  @ApiProperty()
  travelDate: Date;

  @Column({ name: 'remaining_slot', type: 'int', default: 0 })
  @ApiProperty({ description: 'số khả dụng cho phép book', default: 0 })
  remainingSlot: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: TourSessionStatus.INACTIVE,
  })
  @ApiProperty({ enum: TourSessionStatus })
  status: TourSessionStatus;

  @ManyToOne(() => Option)
  @JoinColumn({
    name: 'option_id',
    foreignKeyConstraintName: 'FK_TourSession_Option',
  })
  option: Option;

  @OneToMany(() => UnitReference, (unitReference) => unitReference.tourSession)
  unitReferences: UnitReference[];
}
