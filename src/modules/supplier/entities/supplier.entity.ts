import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('supplier')
export class Supplier extends BaseEntity {
  @Column({ length: 255 })
  @ApiProperty()
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ nullable: true })
  contact: string;

  @Column({ length: 500, nullable: true })
  @ApiProperty({ nullable: true })
  avatar: string;

  @Column({ type: 'int', name: 'rating_count', default: 0 })
  @ApiProperty({ default: 0 })
  ratingCount: number;

  @Column({ type: 'float', name: 'rating_rate', default: 0 })
  @ApiProperty({ default: 0 })
  ratingRate: number;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  @ApiProperty({ default: false })
  isVerified: boolean;

  @Column({ type: 'int', name: 'tour_offered', default: 0 })
  @ApiProperty({ default: 0 })
  tourOffered: number;

  @Column({ type: 'float', name: 'response_rate', default: 0 })
  @ApiProperty({ default: 0 })
  responseRate: number;

  @Column({ type: 'int', name: 'exp_years', default: 1 })
  @ApiProperty({ default: 1 })
  expYears: number;

  @OneToMany(() => Product, (product) => product.supplier)
  products: Product[];
}
