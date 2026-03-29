import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { VideoType } from 'src/modules/video/video.type';

@Entity('video')
export class Video extends BaseEntity {
  @Column({ nullable: false, length: 500 })
  name: string;

  @Column({ nullable: true })
  slug?: string;

  @Column({ nullable: true, length: 500 })
  url?: string;

  @Column({ nullable: true, name: 'embed_url' })
  embedUrl?: string;

  @Column({ name: 'short_url', nullable: true, length: 500 })
  shortUrl?: string;

  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true, length: 255 })
  tag?: string;

  @Column({ nullable: true })
  embedding?: string;

  @Column({ type: 'integer', default: 0 })
  like: string;

  @Column({ default: VideoType.NORMAL, length: 50 })
  type: VideoType;

  @ManyToOne(() => Product, (product) => product.videos)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'Fk_Video_Product',
  })
  product: Product;
}
