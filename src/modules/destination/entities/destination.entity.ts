import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';

@Entity('destination')
export class Destination extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.destination)
  products: Product[];

  @OneToMany(() => TourGuide, (tourGuide) => tourGuide.location)
  tourGuides: TourGuide[];
}
