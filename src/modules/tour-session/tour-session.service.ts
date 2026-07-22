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

import { TourSession } from './entities/tour-session.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { UnitReference } from 'src/modules/unit-reference/entities/unit-reference.entity';
import { CreateTourSessionDto } from './dto/create-tour-session.dto';
import { UpdateTourSessionDto } from './dto/update-tour-session.dto';
import { GetTourSessionDto } from './dto/get-tour-session.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

@Injectable()
export class TourSessionService {
  constructor(
    @InjectRepository(TourSession)
    private readonly tourSessionRepository: Repository<TourSession>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(UnitReference)
    private readonly unitReferenceRepository: Repository<UnitReference>,
  ) {}

  async create(payload: CreateTourSessionDto) {
    const option = await this.optionRepository.findOne({
      where: { id: payload.optionId },
    });
    if (!option) throw new NotFoundException('Option Not Found');

    if (payload.unitRefId) {
      const unitRef = await this.unitReferenceRepository.findOne({
        where: { id: payload.unitRefId },
      });
      if (!unitRef) throw new NotFoundException('Unit Reference Not Found');
    }

    const newTourSession = this.tourSessionRepository.create({
      ...payload,
      remainingSlot: payload.remainingSlot ?? payload.capacity,
    });

    return this.tourSessionRepository.save(newTourSession);
  }

  async update(id: string, payload: UpdateTourSessionDto) {
    const tourSession = await this.findOneById(id);
    if (!tourSession) throw new NotFoundException('Tour Session not found');

    if (payload.unitRefId) {
      const unitRef = await this.unitReferenceRepository.findOne({
        where: { id: payload.unitRefId },
      });
      if (!unitRef) throw new NotFoundException('Unit Reference Not Found');
    }

    Object.assign(tourSession, payload);
    return this.tourSessionRepository.save(tourSession);
  }

  async remove(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Tour Session not found');

    await this.tourSessionRepository.softDelete(id);
    const removed = await this.findOneById(id, true);
    if (!removed) throw new NotFoundException('Tour Session not found');
    return removed;
  }

  async findAll(
    query: GetTourSessionDto,
  ): Promise<ListItemsResponse<TourSession>> {
    const {
      optionId,
      status,
      fromDate,
      toDate,
      page = 1,
      pageSize = 10,
    } = query;
    const skip = (page - 1) * pageSize;

    const condition: FindOptionsWhere<TourSession> = {};

    if (optionId) {
      condition.optionId = optionId;
    }

    if (status) {
      condition.status = status;
    }

    if (fromDate && toDate) {
      condition.travelDate = Between(new Date(fromDate), new Date(toDate));
    } else if (fromDate) {
      condition.travelDate = MoreThanOrEqual(new Date(fromDate));
    } else if (toDate) {
      condition.travelDate = LessThanOrEqual(new Date(toDate));
    }

    const [tourSessions, total] = await this.tourSessionRepository.findAndCount(
      {
        where: condition,
        take: pageSize,
        skip,
        relations: {
          unitRef: true,
        },
        order: { travelDate: 'ASC' },
      },
    );

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      items: tourSessions,
      pagination,
    };
  }

  async findOneById(id: string, withDeleted = false) {
    return this.tourSessionRepository.findOne({
      where: { id },
      withDeleted,
    });
  }

  async find(options?: FindManyOptions<TourSession>) {
    return this.tourSessionRepository.find(options);
  }

  async findOne(options: FindOneOptions<TourSession>) {
    return this.tourSessionRepository.findOne(options);
  }
}
