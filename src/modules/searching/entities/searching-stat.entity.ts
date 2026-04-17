import { BaseEntity } from 'src/database/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('searching_stat')
export class SearchingStat extends BaseEntity {
  @Column({ type: 'text', nullable: false, unique: true })
  query: string;

  @Column({ type: 'int', name: 'total_count', default: 1 })
  totalCount: number;

  @Column({ type: 'int', name: 'month_count', default: 1 })
  monthCount: number;

  @Column({
    type: 'timestamptz',
    name: 'last_searched_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastSearchedAt: Date;
}
