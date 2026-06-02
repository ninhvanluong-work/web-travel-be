import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Product } from 'src/modules/product/entities/product.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';

export enum ProductTourGuideEnum {
  REFER = 'refer',
  GUIDE = 'guide',
}

@Entity('product_tour_guide')
export class ProductTourGuide {
  @PrimaryColumn('uuid', { name: 'product_id' })
  productId: string;

  @PrimaryColumn('uuid', { name: 'tour_guide_id' })
  tourGuideId: string;

  @Column('varchar', {
    default: ProductTourGuideEnum.REFER,
    length: 50,
    nullable: false,
  })
  type: ProductTourGuideEnum;

  @ManyToOne(() => Product)
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'Fk_ProductTourGuide_Product',
  })
  product: Product;

  @ManyToOne(() => TourGuide)
  @JoinColumn({
    name: 'tour_guide_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'Fk_ProductTourGuide_TourGuide',
  })
  tourGuide: TourGuide;
}
