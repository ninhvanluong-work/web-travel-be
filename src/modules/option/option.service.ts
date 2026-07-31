import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  FindOptionsWhere,
  FindOneOptions,
  FindManyOptions,
} from 'typeorm';

import { Option } from './entities/option.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { GetOptionDto } from './dto/get-option.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

@Injectable()
export class OptionService {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(payload: CreateOptionDto) {
    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const newOption = this.optionRepository.create(payload);
    return this.optionRepository.save(newOption);
  }

  async update(id: string, payload: UpdateOptionDto) {
    const option = await this.findOneById(id);
    if (!option) throw new NotFoundException('Option not found');

    Object.assign(option, payload);
    return this.optionRepository.save(option);
  }

  async remove(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Option not found');

    await this.optionRepository.softDelete(id);
    const removedOption = await this.findOneById(id, true);
    if (!removedOption) throw new NotFoundException('Option not found');
    return removedOption;
  }

  async findAll(query: GetOptionDto): Promise<ListItemsResponse<Option>> {
    const { keyword, productId, status, page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const condition: FindOptionsWhere<Option> = {};

    if (keyword) {
      condition.title = ILike(`%${keyword}%`);
    }

    if (productId) {
      condition.productId = productId;
    }

    if (status) {
      condition.status = status;
    }

    const [options, total] = await this.optionRepository.findAndCount({
      where: condition,
      take: pageSize,
      skip,
      order: { order: 'ASC', createdAt: 'DESC' },
    });

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      items: options,
      pagination,
    };
  }

  async findOneById(id: string, withDeleted = false) {
    return this.optionRepository.findOne({
      where: { id },
      withDeleted,
    });
  }

  async find(options?: FindManyOptions<Option>) {
    return this.optionRepository.find(options);
  }

  async findOne(options: FindOneOptions<Option>) {
    return this.optionRepository.findOne(options);
  }
}
