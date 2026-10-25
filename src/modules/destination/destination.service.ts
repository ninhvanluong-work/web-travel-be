import { escapeLike } from 'src/common/utils/sql';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { GetDestinationDto } from './dto/get-destination.dto';

@Injectable()
export class DestinationService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(payload: CreateDestinationDto, userId: string) {
    const name = payload.name;

    const destination = this.destinationRepository.create({
      ...payload,
      name,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.destinationRepository.save(destination);
  }

  async findAll(
    query: GetDestinationDto,
  ): Promise<ListItemsResponse<Destination>> {
    const { keyword = '', page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const condition: FindOptionsWhere<Destination> = {
      name: ILike(`%${escapeLike(keyword)}%`),
    };

    const [destinations, total] = await this.destinationRepository.findAndCount(
      {
        where: condition,
        take: pageSize,
        skip,
        order: { createdAt: 'DESC' },
      },
    );

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
    return {
      items: destinations,
      pagination,
    };
  }

  async findOneById(id: string, withDeleted = false) {
    return this.destinationRepository.findOne({
      where: { id },
      withDeleted,
    });
  }

  async update(id: string, payload: UpdateDestinationDto, userId: string) {
    const destination = await this.findOneById(id);
    if (!destination) throw new NotFoundException('Destination not found');

    Object.assign(destination, payload, { updatedBy: userId });
    return this.destinationRepository.save(destination);
  }

  async remove(id: string, userId: string) {
    const destination = await this.findOneById(id);
    if (!destination) throw new NotFoundException('Destination not found');

    // product.destination_id is NOT NULL, so block deleting a destination still in use
    const productCount = await this.productRepository.count({
      where: { destinationId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Destination is used by ${productCount} product(s), cannot delete`,
      );
    }

    await this.destinationRepository.update(id, { deletedBy: userId });
    await this.destinationRepository.softDelete(id);
    return {};
  }
}
