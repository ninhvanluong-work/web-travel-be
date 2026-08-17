import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SupplierPayment } from 'src/modules/supplier/entities/supplier-payment.entity';
import { CreateSupplierPaymentDto } from 'src/modules/supplier/dto/create-supplier-payment.dto';
import { UpdateSupplierPaymentDto } from 'src/modules/supplier/dto/update-supplier-payment.dto';
import { GetSupplierPaymentsDto } from 'src/modules/supplier/dto/get-supplier-payment.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

@Injectable()
export class SupplierPaymentService {
  constructor(
    @InjectRepository(SupplierPayment)
    private readonly supplierPaymentRepository: Repository<SupplierPayment>,
  ) {}

  async create(payload: CreateSupplierPaymentDto) {
    if (payload.isDefault) {
      await this.clearDefault(payload.supplierId);
    }
    const supplierPayment = this.supplierPaymentRepository.create(payload);
    return this.supplierPaymentRepository.save(supplierPayment);
  }

  async findAll(
    query: GetSupplierPaymentsDto,
  ): Promise<ListItemsResponse<SupplierPayment>> {
    const { page = 1, pageSize = 10, supplierId, method } = query;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.supplierPaymentRepository.findAndCount({
      where: {
        ...(supplierId && { supplierId }),
        ...(method && { method }),
      },
      take: pageSize,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { items, pagination };
  }

  async findOneById(id: string) {
    const supplierPayment = await this.supplierPaymentRepository.findOne({
      where: { id },
    });
    if (!supplierPayment) {
      throw new NotFoundException('Supplier payment not found');
    }
    return supplierPayment;
  }

  async update(id: string, payload: UpdateSupplierPaymentDto) {
    const supplierPayment = await this.findOneById(id);
    if (payload.isDefault) {
      await this.clearDefault(payload.supplierId ?? supplierPayment.supplierId);
    }
    Object.assign(supplierPayment, payload);
    return this.supplierPaymentRepository.save(supplierPayment);
  }

  async remove(id: string) {
    await this.findOneById(id);
    await this.supplierPaymentRepository.softDelete(id);
  }

  private async clearDefault(supplierId: string) {
    await this.supplierPaymentRepository.update(
      { supplierId, isDefault: true },
      { isDefault: false },
    );
  }
}
