import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('video')
export class Video extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true, length: 255 })
  tag?: string;

  @Column({ type: 'string', nullable: true })
  embedding?: string;

  @ManyToOne(() => Product, (product) => product.videos)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
