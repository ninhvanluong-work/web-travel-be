import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('supplier')
export class Supplier extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true })
  contact: string;

  @OneToMany(() => Product, (product) => product.supplier)
  products: Product[];
}
