import { ApiProperty } from '@nestjs/swagger';

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  @ApiProperty({ nullable: true })
  deletedAt: Date;
}
