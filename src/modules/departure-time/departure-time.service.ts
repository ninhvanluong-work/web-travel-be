import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

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

  // manager: truyền vào khi được gọi bên trong transaction của service khác
  private getDepartureTimeRepository(manager?: EntityManager) {
    return (
      manager?.getRepository(DepartureTime) ?? this.departureTimeRepository
    );
  }

  async create(
    payload: CreateDepartureTimeDto,
    userId: string,
    manager?: EntityManager,
  ) {
    const departureTimeRepository = this.getDepartureTimeRepository(manager);
    const productRepository =
      manager?.getRepository(Product) ?? this.productRepository;

    const product = await productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const newDepartureTime = departureTimeRepository.create({
      ...payload,
      createdBy: userId,
      updatedBy: userId,
    });
    return departureTimeRepository.save(newDepartureTime);
  }

  async update(
    id: string,
    payload: UpdateDepartureTimeDto,
    userId: string,
    manager?: EntityManager,
  ) {
    const departureTime = await this.findOneById(id, false, manager);
    if (!departureTime) throw new NotFoundException('Departure Time not found');

    Object.assign(departureTime, payload, { updatedBy: userId });
    return this.getDepartureTimeRepository(manager).save(departureTime);
  }

  async remove(id: string, userId: string, manager?: EntityManager) {
    const departureTimeRepository = this.getDepartureTimeRepository(manager);

    const found = await this.findOneById(id, false, manager);
    if (!found) throw new NotFoundException('Departure Time not found');

    await departureTimeRepository.update(id, { deletedBy: userId });
    await departureTimeRepository.softDelete(id);
    const removed = await this.findOneById(id, true, manager);
    if (!removed) throw new NotFoundException('Departure Time not found');
    return removed;
  }

  async findByProduct(productId: string, manager?: EntityManager) {
    return this.getDepartureTimeRepository(manager).find({
      where: { productId },
      order: { order: 'ASC' },
    });
  }

  async findOneById(id: string, withDeleted = false, manager?: EntityManager) {
    return this.getDepartureTimeRepository(manager).findOne({
      where: { id },
      withDeleted,
    });
  }
}
