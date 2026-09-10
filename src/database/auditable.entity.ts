import { ApiProperty } from '@nestjs/swagger';

import { Column } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';

export abstract class AuditableEntity extends BaseEntity {
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @ApiProperty({ nullable: true })
  createdBy?: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  @ApiProperty({ nullable: true })
  updatedBy?: string | null;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  @ApiProperty({ nullable: true })
  deletedBy?: string | null;
}
