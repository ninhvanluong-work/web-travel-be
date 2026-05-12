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

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ default: 0 })
  ratingCount: number;

  @Column({ type: 'float', default: 0 })
  @ApiProperty({ default: 0 })
  ratingRate: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ default: false })
  isVerified: boolean;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ default: 0 })
  tourOffered: number;

  @Column({ type: 'float', default: 0 })
  @ApiProperty({ default: 0 })
  responseRate: number;

  @OneToMany(() => Product, (product) => product.supplier)
  products: Product[];
}
