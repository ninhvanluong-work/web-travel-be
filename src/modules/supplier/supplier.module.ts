import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SupplierService } from 'src/modules/supplier/supplier.service';
import { SupplierController } from 'src/modules/supplier/supplier.controller';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
