import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { CreateSupplierDto } from 'src/modules/supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from 'src/modules/supplier/dto/update-supplier.dto';
import { GetSuppliersDto } from 'src/modules/supplier/dto/get-supplier.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  create(payload: CreateSupplierDto) {
    const supplier = this.supplierRepository.create(payload);
    return this.supplierRepository.save(supplier);
  }

  async findAll(query: GetSuppliersDto): Promise<ListItemsResponse<Supplier>> {
    const { page = 1, pageSize = 10, keyword = '' } = query;
    const skip = (page - 1) * pageSize;

    const [suppliers, total] = await this.supplierRepository.findAndCount({
      where: {
        name: ILike(`%${keyword}%`),
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

    return {
      items: suppliers,
      pagination,
    };
  }

  async findOneById(id: string) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async update(id: string, payload: UpdateSupplierDto) {
    const supplier = await this.findOneById(id);
    Object.assign(supplier, payload);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string) {
    await this.findOneById(id);
    await this.supplierRepository.softDelete(id);
  }
}
