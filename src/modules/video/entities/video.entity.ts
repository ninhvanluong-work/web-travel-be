import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Import Swagger decorators
import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { VideoType } from 'src/modules/video/video.type';
import { BunnyVideoStatus } from 'src/modules/webhook/types/bunny-webhook.type';

@Entity('video')
export class Video extends BaseEntity {
  @ApiProperty({
    example: 'ha noi tour',
  })
  @Column({ nullable: false, length: 500 })
  name: string;

  @ApiPropertyOptional({ example: 'ha-noi-tour' })
  @Column({ nullable: true })
  slug?: string;

  @ApiPropertyOptional({ example: 'https://abc.com/watch?v=abc' })
  @Column({ nullable: true, length: 500 })
  url?: string;

  @ApiPropertyOptional({ example: 'https://abc.com/embed/abc' })
  @Column({ nullable: true, name: 'embed_url' })
  embedUrl?: string;

  @ApiPropertyOptional({ example: 'https://bit.ly/video1' })
  @Column({ name: 'short_url', nullable: true, length: 500 })
  shortUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.image.com/thumb.jpg' })
  @Column({ nullable: true })
  thumbnail?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Mô tả chi tiết video' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({ example: 'review, tech' })
  @Column({ nullable: true, length: 255 })
  tag?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  embedding?: string;

  @ApiProperty({ default: 0 })
  @Column({ type: 'integer', default: 0 })
  like: number;

  @ApiProperty({ enum: VideoType, default: VideoType.NORMAL })
  @Column({ default: VideoType.NORMAL, length: 50 })
  type: VideoType;

  @ApiProperty({ description: 'bunny video guid' })
  @Column({ nullable: true, length: 255, unique: true })
  guid: string;

  @ApiProperty({ description: 'uploading status', enum: BunnyVideoStatus })
  @Column({ nullable: true, type: 'integer', name: 'uploading_status' })
  uploadingStatus: BunnyVideoStatus;

  @Column({ name: 'product_id' })
  productId: string;

  //@ApiProperty({ type: () => Product })
  @ManyToOne(() => Product, (product) => product.videos)
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'Fk_Video_Product',
  })
  product: Product;
}
