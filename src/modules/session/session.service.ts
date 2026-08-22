import {
  Injectable,
  Logger,
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
import {
  CreateSessionRangeDto,
  DuplicateStrategy,
} from './dto/create-session-range.dto';
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
  private readonly logger = new Logger(SessionService.name);

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
    this.logger.debug(`create() payload=${JSON.stringify(payload)}`);

    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) {
      this.logger.warn(
        `create() rejected: product ${payload.productId} not found`,
      );
      throw new NotFoundException('Product Not Found');
    }

    const travelDate = startOfDay(new Date(payload.travelDate));
    const existing = await this.sessionRepository.findOne({
      where: {
        productId: payload.productId,
        travelDate: Between(travelDate, endOfDay(travelDate)),
      },
    });
    if (existing) {
      this.logger.warn(
        `create() skipped: session already exists for product ${payload.productId} on ${formatDateOnly(travelDate)}`,
      );
      return this.findOneById(existing.id);
    }

    if (payload.sessionUnits?.length) {
      const unitIds = payload.sessionUnits.map((su) => su.unitId);
      if (new Set(unitIds).size !== unitIds.length) {
        this.logger.warn(
          `create() rejected: duplicate unitId in sessionUnits for product ${payload.productId}`,
        );
        throw new BadRequestException('Duplicate unitId in sessionUnits');
      }

      const units = await this.unitRepository.find({
        where: { id: In(unitIds), productId: payload.productId },
      });
      if (units.length !== unitIds.length) {
        this.logger.warn(
          `create() rejected: one or more units not found for product ${payload.productId}, requested=${unitIds.join(',')}`,
        );
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

    this.logger.log(
      `create() session ${newSession.id} created for product ${payload.productId} on ${formatDateOnly(travelDate)}`,
    );

    return this.findOneById(newSession.id);
  }

  async createRange(payload: CreateSessionRangeDto) {
    this.logger.debug(`createRange() payload=${JSON.stringify(payload)}`);

    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) {
      this.logger.warn(
        `createRange() rejected: product ${payload.productId} not found`,
      );
      throw new NotFoundException('Product Not Found');
    }

    const start = startOfDay(new Date(payload.fromDate));
    const end = payload.toDate ? startOfDay(new Date(payload.toDate)) : start;

    if (end < start) {
      this.logger.warn(
        `createRange() rejected: toDate ${payload.toDate} before fromDate ${payload.fromDate}`,
      );
      throw new BadRequestException(
        'toDate must be greater than or equal to fromDate',
      );
    }

    const days =
      Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (days > MAX_RANGE_DAYS) {
      this.logger.warn(
        `createRange() rejected: range of ${days} days exceeds max ${MAX_RANGE_DAYS}`,
      );
      throw new BadRequestException(
        `date range must not exceed ${MAX_RANGE_DAYS} days`,
      );
    }

    if (payload.sessionUnits?.length) {
      const unitIds = payload.sessionUnits.map((su) => su.unitId);
      if (new Set(unitIds).size !== unitIds.length) {
        this.logger.warn(
          `createRange() rejected: duplicate unitId in sessionUnits for product ${payload.productId}`,
        );
        throw new BadRequestException('Duplicate unitId in sessionUnits');
      }

      const units = await this.unitRepository.find({
        where: { id: In(unitIds), productId: payload.productId },
      });
      if (units.length !== unitIds.length) {
        this.logger.warn(
          `createRange() rejected: one or more units not found for product ${payload.productId}, requested=${unitIds.join(',')}`,
        );
        throw new NotFoundException(
          'One or more units not found for this product',
        );
      }
    }

    const duplicateStrategy =
      payload.duplicateStrategy ?? DuplicateStrategy.SKIP;

    const existingSessions = await this.sessionRepository.find({
      where: {
        productId: payload.productId,
        travelDate: Between(start, endOfDay(end)),
      },
      relations: { sessionUnits: true },
    });
    const existingByDateKey = new Map(
      existingSessions.map((s) => [
        startOfDay(new Date(s.travelDate)).getTime(),
        s,
      ]),
    );

    // Full list of candidate dates in the range, narrowed down to the
    // selected weekdays only (daysOfWeek uses ISO weekday: 1=Mon...7=Sun,
    // while Date.getDay() returns 0=Sun...6=Sat, hence the 0 -> 7 remap).
    const allDates = Array.from({ length: days }, (_, i) => {
      const travelDate = new Date(start);
      travelDate.setDate(travelDate.getDate() + i);
      return travelDate;
    }).filter((travelDate) => {
      if (!payload.daysOfWeek?.length) return true;
      const isoWeekday = travelDate.getDay() === 0 ? 7 : travelDate.getDay();
      return payload.daysOfWeek.includes(isoWeekday);
    });

    // Dates with no existing session -> always created.
    const newSessions = allDates
      .filter((travelDate) => !existingByDateKey.has(travelDate.getTime()))
      .map((travelDate) =>
        this.sessionRepository.create({
          productId: payload.productId,
          travelDate,

          //capacity: payload.capacity ?? 0,
          status: payload.status ?? SessionStatus.ACTIVE,
        }),
      );

    // Dates that already have a session -> handled per duplicateStrategy below.
    const conflictingSessions = allDates
      .filter((travelDate) => existingByDateKey.has(travelDate.getTime()))
      .map((travelDate) => existingByDateKey.get(travelDate.getTime())!);

    // SKIP + nothing new to create is only an error when the caller actually
    // asked for dates (allDates.length > 0); an empty daysOfWeek match should
    // just return an empty result instead of looking like a conflict.
    if (
      duplicateStrategy === DuplicateStrategy.SKIP &&
      newSessions.length === 0 &&
      allDates.length > 0
    ) {
      this.logger.warn(
        `createRange() rejected: session already exists for product ${payload.productId} on ${formatDateSpan(start, end)}`,
      );
      throw new ConflictException(
        `Session already exists for this product on ${formatDateSpan(start, end)}`,
      );
    }

    if (newSessions.length) {
      await this.sessionRepository.save(newSessions);
    }

    // OVERWRITE: update status and fully replace sessionUnits on the
    // conflicting sessions instead of skipping them.
    let overwrittenSessions: Session[] = [];
    if (
      duplicateStrategy === DuplicateStrategy.OVERWRITE &&
      conflictingSessions.length
    ) {
      for (const session of conflictingSessions) {
        session.status = payload.status ?? session.status;
      }
      await this.sessionRepository.save(conflictingSessions);

      if (payload.sessionUnits?.length) {
        const toDelete = conflictingSessions.flatMap(
          (session) => session.sessionUnits ?? [],
        );
        if (toDelete.length) {
          await this.sessionUnitRepository.remove(toDelete);
        }
      }

      overwrittenSessions = conflictingSessions;
    }

    // sessionUnits from the payload apply uniformly to both freshly created
    // sessions and sessions that were just overwritten.
    const affectedSessions = [...newSessions, ...overwrittenSessions];

    if (payload.sessionUnits?.length && affectedSessions.length) {
      const sessionUnits = affectedSessions.flatMap((session) =>
        payload.sessionUnits!.map((su) =>
          this.sessionUnitRepository.create({
            sessionId: session.id,
            unitId: su.unitId,
            price: su.price,
          }),
        ),
      );
      await this.sessionUnitRepository.save(sessionUnits);
    }

    this.logger.log(
      `createRange() created ${newSessions.length} and overwrote ${overwrittenSessions.length} session(s) for product ${payload.productId} on ${formatDateSpan(start, end)}`,
    );

    if (affectedSessions.length === 0) {
      return [];
    }

    return this.find({
      where: { id: In(affectedSessions.map((s) => s.id)) },
      relations: { sessionUnits: { unit: true } },
      order: { travelDate: 'ASC' },
    });
  }

  async update(id: string, payload: UpdateSessionDto) {
    this.logger.debug(`update() id=${id} payload=${JSON.stringify(payload)}`);

    const session = await this.findOneById(id);
    if (!session) {
      this.logger.warn(`update() rejected: session ${id} not found`);
      throw new NotFoundException('Session not found');
    }

    const { sessionUnits: sessionUnitsInput, ...sessionFields } = payload;

    if (sessionUnitsInput !== undefined) {
      const unitIds = sessionUnitsInput.map((su) => su.unitId);
      if (new Set(unitIds).size !== unitIds.length) {
        this.logger.warn(
          `update() rejected: duplicate unitId in sessionUnits for session ${id}`,
        );
        throw new BadRequestException('Duplicate unitId in sessionUnits');
      }

      if (unitIds.length) {
        const units = await this.unitRepository.find({
          where: { id: In(unitIds), productId: session.productId },
        });
        if (units.length !== unitIds.length) {
          this.logger.warn(
            `update() rejected: one or more units not found for session ${id}, requested=${unitIds.join(',')}`,
          );
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

    this.logger.log(`update() session ${id} updated`);

    return this.findOneById(id);
  }

  async remove(id: string) {
    this.logger.debug(`remove() id=${id}`);

    const found = await this.findOneById(id);
    if (!found) {
      this.logger.warn(`remove() rejected: session ${id} not found`);
      throw new NotFoundException('Session not found');
    }

    await this.sessionRepository.softDelete(id);
    const removed = await this.findOneById(id, true);
    if (!removed) {
      this.logger.warn(`remove() session ${id} not found after soft delete`);
      throw new NotFoundException('Session not found');
    }

    this.logger.log(`remove() session ${id} soft deleted`);

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
