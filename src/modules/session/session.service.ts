import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  FindOneOptions,
  FindManyOptions,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
} from 'typeorm';

import { Session, SessionStatus } from './entities/session.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';
import { SessionUnit } from 'src/modules/session-unit/entities/session-unit.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateSessionRangeDto } from './dto/create-session-range.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GetSessionDto } from './dto/get-session.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';
import { endOfDay, startOfDay } from 'src/common/utils/date';

const MAX_RANGE_DAYS = 366;

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateSpan(start: Date, end: Date): string {
  return start.getTime() === end.getTime()
    ? formatDateOnly(start)
    : `${formatDateOnly(start)} - ${formatDateOnly(end)}`;
}

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(SessionUnit)
    private readonly sessionUnitRepository: Repository<SessionUnit>,
  ) {}

  async create(payload: CreateSessionDto) {
    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const travelDate = startOfDay(new Date(payload.travelDate));
    const existing = await this.sessionRepository.findOne({
      where: {
        productId: payload.productId,
        travelDate: Between(travelDate, endOfDay(travelDate)),
      },
    });
    if (existing) {
      throw new ConflictException(
        'Session already exists for this product on this date',
      );
    }

    if (payload.sessionUnits?.length) {
      const unitIds = payload.sessionUnits.map((su) => su.unitId);
      if (new Set(unitIds).size !== unitIds.length) {
        throw new BadRequestException('Duplicate unitId in sessionUnits');
      }

      const units = await this.unitRepository.find({
        where: { id: In(unitIds), productId: payload.productId },
      });
      if (units.length !== unitIds.length) {
        throw new NotFoundException(
          'One or more units not found for this product',
        );
      }
    }

    const newSession = this.sessionRepository.create({
      productId: payload.productId,
      travelDate: payload.travelDate,
      status: SessionStatus.ACTIVE,
      //capacity: payload.capacity ?? 0,
    });
    await this.sessionRepository.save(newSession);

    if (payload.sessionUnits?.length) {
      const sessionUnits = payload.sessionUnits.map((su) =>
        this.sessionUnitRepository.create({
          sessionId: newSession.id,
          unitId: su.unitId,
          price: su.price,
        }),
      );
      await this.sessionUnitRepository.save(sessionUnits);
    }

    return this.findOneById(newSession.id);
  }

  async createRange(payload: CreateSessionRangeDto) {
    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const start = startOfDay(new Date(payload.fromDate));
    const end = payload.toDate ? startOfDay(new Date(payload.toDate)) : start;

    if (end < start) {
      throw new BadRequestException(
        'toDate must be greater than or equal to fromDate',
      );
    }

    const days =
      Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (days > MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `date range must not exceed ${MAX_RANGE_DAYS} days`,
      );
    }

    const existingSessions = await this.sessionRepository.find({
      where: {
        productId: payload.productId,
        travelDate: Between(start, endOfDay(end)),
      },
    });
    const existingDateKeys = new Set(
      existingSessions.map((s) => startOfDay(new Date(s.travelDate)).getTime()),
    );

    const newSessions = Array.from({ length: days }, (_, i) => {
      const travelDate = new Date(start);
      travelDate.setDate(travelDate.getDate() + i);
      return travelDate;
    })
      .filter((travelDate) => !existingDateKeys.has(travelDate.getTime()))
      .map((travelDate) =>
        this.sessionRepository.create({
          productId: payload.productId,
          travelDate,
          status: SessionStatus.ACTIVE,
          //capacity: payload.capacity ?? 0,
          //status: payload.status,
        }),
      );

    if (newSessions.length === 0) {
      throw new ConflictException(
        `Session already exists for this product on ${formatDateSpan(start, end)}`,
      );
    }

    return this.sessionRepository.save(newSessions);
  }

  async update(id: string, payload: UpdateSessionDto) {
    const session = await this.findOneById(id);
    if (!session) throw new NotFoundException('Session not found');

    const { sessionUnits: sessionUnitsInput, ...sessionFields } = payload;

    if (sessionUnitsInput !== undefined) {
      const unitIds = sessionUnitsInput.map((su) => su.unitId);
      if (new Set(unitIds).size !== unitIds.length) {
        throw new BadRequestException('Duplicate unitId in sessionUnits');
      }

      if (unitIds.length) {
        const units = await this.unitRepository.find({
          where: { id: In(unitIds), productId: session.productId },
        });
        if (units.length !== unitIds.length) {
          throw new NotFoundException(
            'One or more units not found for this product',
          );
        }
      }

      const existingSessionUnits = session.sessionUnits ?? [];
      const inputByUnitId = new Map(
        sessionUnitsInput.map((su) => [su.unitId, su]),
      );

      const toDelete = existingSessionUnits.filter(
        (su) => !inputByUnitId.has(su.unitId),
      );
      const toUpsert = sessionUnitsInput.map((su) => {
        const existing = existingSessionUnits.find(
          (e) => e.unitId === su.unitId,
        );
        return this.sessionUnitRepository.create({
          id: existing?.id,
          sessionId: id,
          unitId: su.unitId,
          price: su.price,
        });
      });

      if (toDelete.length) {
        await this.sessionUnitRepository.remove(toDelete);
      }
      if (toUpsert.length) {
        await this.sessionUnitRepository.save(toUpsert);
      }
    }

    Object.assign(session, sessionFields);
    await this.sessionRepository.save(session);

    return this.findOneById(id);
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
      relations: {
        sessionUnits: {
          unit: true,
        },
      },
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
      relations: {
        sessionUnits: {
          unit: true,
        },
      },
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
