import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SupplierService } from 'src/modules/supplier/supplier.service';
import { SupplierController } from 'src/modules/supplier/supplier.controller';
import { SupplierPaymentService } from 'src/modules/supplier/supplier-payment.service';
import { SupplierPaymentController } from 'src/modules/supplier/supplier-payment.controller';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { SupplierPayment } from 'src/modules/supplier/entities/supplier-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, SupplierPayment])],
  controllers: [SupplierController, SupplierPaymentController],
  providers: [SupplierService, SupplierPaymentService],
  exports: [SupplierService, SupplierPaymentService],
})
export class SupplierModule {}
