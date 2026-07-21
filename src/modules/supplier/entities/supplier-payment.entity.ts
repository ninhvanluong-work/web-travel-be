import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/database/base.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

export enum SupplierPaymentMethod {
  BANK = 'bank',
  PAYPAL = 'paypal',
}

@Entity('supplier_payment')
export class SupplierPayment extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    default: SupplierPaymentMethod.BANK,
  })
  @ApiProperty({ enum: SupplierPaymentMethod })
  method: SupplierPaymentMethod;

  @Column({ nullable: true, length: 255 })
  @ApiProperty({ nullable: true })
  bank: string;

  @Column({ name: 'account_holder', nullable: true, length: 255 })
  @ApiProperty({ nullable: true })
  accountHolder: string;

  @Column({ name: 'account_number', nullable: true, length: 100 })
  @ApiProperty({ nullable: true })
  accountNumber: string;

  @Column({ name: 'swift_code', nullable: true, length: 50 })
  @ApiProperty({ nullable: true })
  swiftCode: string;

  @Column({ name: 'branch_address', nullable: true, length: 500 })
  @ApiProperty({ nullable: true })
  branchAddress: string;

  @Column({ name: 'paypal_email', nullable: true, length: 255 })
  @ApiProperty({ nullable: true })
  paypalEmail: string;

  @Column({ nullable: true, default: 'VND', length: 10 })
  @ApiProperty({ example: 'VND' })
  currency: string;

  @Column({ name: 'tax_id', nullable: true, length: 100 })
  @ApiProperty({ nullable: true })
  taxId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({
    name: 'supplier_id',
    foreignKeyConstraintName: 'Fk_SupplierPayment_Supplier',
  })
  supplier: Supplier;
}
