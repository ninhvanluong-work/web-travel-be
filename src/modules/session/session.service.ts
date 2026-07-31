import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  FindOneOptions,
  FindManyOptions,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import { Session } from './entities/session.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GetSessionDto } from './dto/get-session.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';
import { endOfDay, startOfDay } from 'src/common/utils/date';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(payload: CreateSessionDto) {
    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const newSession = this.sessionRepository.create({
      ...payload,
      capacity: payload.capacity ?? 0,
    });

    return this.sessionRepository.save(newSession);
  }

  async update(id: string, payload: UpdateSessionDto) {
    const session = await this.findOneById(id);
    if (!session) throw new NotFoundException('Session not found');

    Object.assign(session, payload);
    return this.sessionRepository.save(session);
  }

  async remove(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Session not found');

    await this.sessionRepository.softDelete(id);
    const removed = await this.findOneById(id, true);
    if (!removed) throw new NotFoundException('Session not found');
    return removed;
  }

  async findAll(query: GetSessionDto): Promise<ListItemsResponse<Session>> {
    const {
      productId,
      status,
      fromDate,
      toDate,
      page = 1,
      pageSize = 10,
    } = query;
    const skip = (page - 1) * pageSize;

    const condition: FindOptionsWhere<Session> = {};

    if (productId) {
      condition.productId = productId;
    }

    if (status) {
      condition.status = status;
    }

    if (fromDate && toDate) {
      condition.travelDate = Between(
        startOfDay(new Date(fromDate)),
        endOfDay(new Date(toDate)),
      );
    } else if (fromDate) {
      condition.travelDate = MoreThanOrEqual(startOfDay(new Date(fromDate)));
    } else if (toDate) {
      condition.travelDate = LessThanOrEqual(endOfDay(new Date(toDate)));
    }

    const [sessions, total] = await this.sessionRepository.findAndCount({
      where: condition,
      take: pageSize,
      skip,
      order: { travelDate: 'ASC' },
    });

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      items: sessions,
      pagination,
    };
  }

  async findOneById(id: string, withDeleted = false) {
    return this.sessionRepository.findOne({
      where: { id },
      withDeleted,
    });
  }

  async find(options?: FindManyOptions<Session>) {
    return this.sessionRepository.find(options);
  }

  async findOne(options: FindOneOptions<Session>) {
    return this.sessionRepository.findOne(options);
  }
}
