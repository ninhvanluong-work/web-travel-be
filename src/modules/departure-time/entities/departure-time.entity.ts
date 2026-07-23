import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Option } from 'src/modules/option/entities/option.entity';

@Entity('departure_time')
export class DepartureTime extends BaseEntity {
  @Column({ name: 'option_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  optionId: string;

  @Column({ type: 'time' })
  @ApiProperty({ example: '07:30:00', description: 'giờ khởi hành' })
  time: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ nullable: true, example: 'Khởi hành sáng' })
  label: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ default: 0 })
  order: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ nullable: true })
  note: string;

  @ManyToOne(() => Option)
  @JoinColumn({
    name: 'option_id',
    foreignKeyConstraintName: 'FK_DepartureTime_Option',
  })
  option: Option;
}
