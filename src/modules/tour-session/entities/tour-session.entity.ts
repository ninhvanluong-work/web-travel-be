import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
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

  @Column({ name: 'departure_time', type: 'timestamptz', nullable: true })
  @ApiProperty()
  departureTime: Date;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'số lượng khách', default: 0 })
  capacity: number;

  @Column({ name: 'remaining_slot', type: 'int', default: 0 })
  @ApiProperty({ description: 'số khả dụng cho phép book', default: 0 })
  remainingSlot: number;

  @Column({ name: 'unit_ref_id', type: 'uuid', nullable: true })
  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  unitRefId: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @ApiProperty({ description: 'giá từng slot', default: 0 })
  price: number;

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

  @ManyToOne(() => UnitReference)
  @JoinColumn({
    name: 'unit_ref_id',
    foreignKeyConstraintName: 'FK_TourSession_UnitReference',
  })
  unitRef: UnitReference;
}
