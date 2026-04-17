import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('searching_log')
export class SearchingLog extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  query: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'ip_address', length: 50 })
  ipAddress: string;

  @ManyToOne(() => User, (user) => user.searchingLogs)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_SearchingLog_User',
  })
  user: User;
}
