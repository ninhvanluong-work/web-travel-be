import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

export enum SupplierPaymentMethod {
  BANK = 'bank',
  CARD = 'card',
  PAYPAL = 'paypal',
  VNPAY = 'vnpay',
}

export interface SupplierPaymentBankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  swiftCode?: string;
}

export interface SupplierPaymentCardDetails {
  cardHolder: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface SupplierPaymentPaypalDetails {
  email: string;
}

export type SupplierPaymentDetails =
  | SupplierPaymentBankDetails
  | SupplierPaymentCardDetails
  | SupplierPaymentPaypalDetails
  | Record<string, any>;

@Entity('supplier_payment')
export class SupplierPayment extends BaseEntity {
  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: SupplierPaymentMethod.BANK,
  })
  @ApiProperty({ enum: SupplierPaymentMethod })
  method: SupplierPaymentMethod;

  @Column({ nullable: true, default: 'VND', length: 10 })
  @ApiProperty({ example: 'VND' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  details: SupplierPaymentDetails;

  @Column({ name: 'is_default', default: false })
  @ApiProperty({ default: false })
  isDefault: boolean;

  @ManyToOne(() => Supplier)
  @JoinColumn({
    name: 'supplier_id',
    foreignKeyConstraintName: 'Fk_SupplierPayment_Supplier',
  })
  supplier: Supplier;
}
