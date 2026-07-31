import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DepartureTime } from './entities/departure-time.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { CreateDepartureTimeDto } from './dto/create-departure-time.dto';
import { UpdateDepartureTimeDto } from './dto/update-departure-time.dto';

@Injectable()
export class DepartureTimeService {
  constructor(
    @InjectRepository(DepartureTime)
    private readonly departureTimeRepository: Repository<DepartureTime>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(payload: CreateDepartureTimeDto) {
    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const newDepartureTime = this.departureTimeRepository.create(payload);
    return this.departureTimeRepository.save(newDepartureTime);
  }

  async update(id: string, payload: UpdateDepartureTimeDto) {
    const departureTime = await this.findOneById(id);
    if (!departureTime) throw new NotFoundException('Departure Time not found');

    Object.assign(departureTime, payload);
    return this.departureTimeRepository.save(departureTime);
  }

  async remove(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Departure Time not found');

    await this.departureTimeRepository.softDelete(id);
    const removed = await this.findOneById(id, true);
    if (!removed) throw new NotFoundException('Departure Time not found');
    return removed;
  }

  async findByProduct(productId: string) {
    return this.departureTimeRepository.find({
      where: { productId },
      order: { order: 'ASC' },
    });
  }

  async findOneById(id: string, withDeleted = false) {
    return this.departureTimeRepository.findOne({
      where: { id },
      withDeleted,
    });
  }
}
