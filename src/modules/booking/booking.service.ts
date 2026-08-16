import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { randomBytes } from 'crypto';

import {
  Booking,
  BookingPassenger,
  BookingStatus,
} from 'src/modules/booking/entities/booking.entity';
import { BookingPayment } from 'src/modules/booking/entities/booking-payment.entity';
import { CreateBookingDto } from 'src/modules/booking/dto/create-booking.dto';
import {
  BookingStatDto,
  BookingStatItemDto,
  GetBookingDto,
} from 'src/modules/booking/dto/get-booking.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';
import { Product } from 'src/modules/product/entities/product.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import {
  Session,
  SessionStatus,
} from 'src/modules/session/entities/session.entity';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';
import { SessionUnit } from 'src/modules/session-unit/entities/session-unit.entity';
import { DepartureTime } from 'src/modules/departure-time/entities/departure-time.entity';

@Injectable()
export class BookingService {
  private logger = new Logger(BookingService.name);

  private prefix(context: string, id?: string): string {
    return `[BookingService:${context}]${id ? ' ' + id : ''}`;
  }

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingPayment)
    private readonly bookingPaymentRepository: Repository<BookingPayment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(PickupLocation)
    private readonly pickupLocationRepository: Repository<PickupLocation>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(SessionUnit)
    private readonly sessionUnitRepository: Repository<SessionUnit>,
    @InjectRepository(DepartureTime)
    private readonly departureTimeRepository: Repository<DepartureTime>,
  ) {}

  private generateBookingCode(): string {
    return `BK${Date.now().toString(36).toUpperCase()}${randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;
  }

  async create(userId: string, payload: CreateBookingDto): Promise<Booking> {
    const prefix = this.prefix('create', userId);
    this.logger.debug(`${prefix} payload=${JSON.stringify(payload)}`);

    if (!payload.passengers?.length) {
      this.logger.warn(`${prefix} rejected: passengers must not be empty`);
      throw new BadRequestException('Passengers must not be empty');
    }

    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
      relations: ['supplier'],
    });
    if (!product) {
      this.logger.warn(
        `${prefix} rejected: product ${payload.productId} not found`,
      );
      throw new NotFoundException('Product not found');
    }

    const option = await this.optionRepository.findOne({
      where: { id: payload.optionId, productId: payload.productId },
    });
    if (!option) {
      this.logger.warn(
        `${prefix} rejected: option ${payload.optionId} not found for product ${payload.productId}`,
      );
      throw new NotFoundException('Option not found');
    }

    const session = await this.sessionRepository.findOne({
      where: { id: payload.tourSessionId, productId: payload.productId },
    });
    if (!session) {
      this.logger.warn(
        `${prefix} rejected: session ${payload.tourSessionId} not found for product ${payload.productId}`,
      );
      throw new NotFoundException('Session not found');
    }
    if (session.status !== SessionStatus.ACTIVE) {
      this.logger.warn(
        `${prefix} rejected: session ${session.id} status is ${session.status}`,
      );
      throw new BadRequestException('Session is not active');
    }

    let pickupLocation: PickupLocation | null = null;
    if (payload.pickupLocationId) {
      pickupLocation = await this.pickupLocationRepository.findOne({
        where: { id: payload.pickupLocationId, productId: payload.productId },
      });
      if (!pickupLocation) {
        this.logger.warn(
          `${prefix} rejected: pickup location ${payload.pickupLocationId} not found for product ${payload.productId}`,
        );
        throw new NotFoundException('Pickup location not found');
      }
    }

    let departure: DepartureTime | null = null;
    if (payload.departureId) {
      departure = await this.departureTimeRepository.findOne({
        where: { id: payload.departureId, productId: payload.productId },
      });
      if (!departure) {
        this.logger.warn(
          `${prefix} rejected: departure time ${payload.departureId} not found for product ${payload.productId}`,
        );
        throw new NotFoundException('Departure time not found');
      }
    }

    const unitIds = payload.passengers.map((passenger) => passenger.unitId);
    const units = await this.unitRepository.find({
      where: { id: In(unitIds) },
    });
    const unitMap = new Map(units.map((unit) => [unit.id, unit]));

    const sessionUnits = await this.sessionUnitRepository.find({
      where: { sessionId: payload.tourSessionId, unitId: In(unitIds) },
    });
    const sessionUnitMap = new Map(
      sessionUnits.map((sessionUnit) => [sessionUnit.unitId, sessionUnit]),
    );

    let totalCount = 0;
    let totalPrice = 0;
    const passengers: BookingPassenger[] = payload.passengers.map(
      (passenger) => {
        const unit = unitMap.get(passenger.unitId);
        if (!unit) {
          this.logger.warn(
            `${prefix} rejected: unit ${passenger.unitId} not found`,
          );
          throw new BadRequestException(`Unit ${passenger.unitId} not found`);
        }
        const sessionUnit = sessionUnitMap.get(passenger.unitId);
        if (!sessionUnit) {
          this.logger.warn(
            `${prefix} rejected: unit ${passenger.unitId} not available for session ${session.id}`,
          );
          throw new BadRequestException(
            `Unit ${passenger.unitId} not available for this session`,
          );
        }
        const price = Number(sessionUnit.price);
        totalCount += passenger.count;
        totalPrice += price * passenger.count;
        return {
          unitId: unit.id,
          unitName: unit.name,
          price,
          count: passenger.count,
        };
      },
    );

    this.logger.debug(
      `${prefix} snapshot passengers=${JSON.stringify(passengers)} totalCount=${totalCount} totalPrice=${totalPrice}`,
    );

    //if (session.capacity < totalCount) {
    //  this.logger.warn(
    //    `${prefix} rejected: not enough capacity (remaining=${session.capacity}, requested=${totalCount})`,
    //  );
    //  throw new BadRequestException('Not enough remaining slot');
    //}

    const booking = this.bookingRepository.create({
      userId,
      productId: payload.productId,
      supplierId: product.supplierId,
      supplierName: product.supplier?.name,
      optionId: payload.optionId,
      tourSessionId: payload.tourSessionId,
      pickupLocationId: payload.pickupLocationId,
      departureId: payload.departureId,
      bookingCode: this.generateBookingCode(),
      travelDate: session.travelDate,
      passengers,
      totalPrice,
      currency: product.currency,
      status: BookingStatus.PENDING,
      email: payload.email,
      phone: payload.phone,
      username: payload.username,
      messengerApp: payload.messengerApp ?? [],
      productName: product.name,
      optionName: option.title,
      pickupLocationName: pickupLocation?.name,
      departureTime: departure?.time,
      departureLabel: departure?.label,
    });

    const savedBooking = await this.bookingRepository.save(booking);
    this.logger.log(
      `${prefix} created booking ${savedBooking.id} (${savedBooking.bookingCode}) totalPrice=${totalPrice}`,
    );

    session.capacity -= totalCount;
    await this.sessionRepository.save(session);
    this.logger.debug(
      `${this.prefix('create', session.id)} capacity ${session.capacity + totalCount} -> ${session.capacity}`,
    );

    return savedBooking;
  }

  buildQueryCondition(
    query: GetBookingDto,
  ): FindOptionsWhere<Booking> | FindOptionsWhere<Booking>[] {
    const condition: FindOptionsWhere<Booking> = {};

    if (query.supplierId) {
      condition.supplierId = query.supplierId;
    }

    if (query.productId) {
      condition.productId = query.productId;
    }

    if (query.status) {
      condition.status = query.status;
    }

    if (query.fromDate && query.toDate) {
      condition.travelDate = Between(
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    } else if (query.fromDate) {
      condition.travelDate = MoreThanOrEqual(new Date(query.fromDate));
    } else if (query.toDate) {
      condition.travelDate = LessThanOrEqual(new Date(query.toDate));
    }

    if (!query.keyword) {
      return condition;
    }

    const keyword = ILike(`%${query.keyword}%`);
    const searchableFields: (keyof Booking)[] = [
      'phone',
      'email',
      'productName',
      'optionName',
      'username',
      'bookingCode',
    ];

    return searchableFields.map((field) => ({
      ...condition,
      [field]: keyword,
    }));
  }

  async findAll(
    query: GetBookingDto,
  ): Promise<ListItemsResponse<Booking, BookingStatDto>> {
    const { page = 1, pageSize = 10 } = query;

    const where = this.buildQueryCondition(query);
    const skip = (page - 1) * pageSize;

    const [bookings, total] = await this.bookingRepository.findAndCount({
      where,
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

    const stats = await this.buildStats(where);

    return {
      items: bookings,
      pagination,
      stats,
    };
  }

  private async buildStats(
    where: FindOptionsWhere<Booking> | FindOptionsWhere<Booking>[],
  ): Promise<BookingStatDto> {
    const rows = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(booking.totalPrice)', 'totalPrice')
      .setFindOptions({ where })
      .groupBy('booking.status')
      .getRawMany<{
        status: BookingStatus;
        count: string;
        totalPrice: string;
      }>();

    const byStatus: Record<BookingStatus, BookingStatItemDto> = {
      [BookingStatus.PENDING]: { count: 0, totalPrice: 0 },
      [BookingStatus.PAID]: { count: 0, totalPrice: 0 },
      [BookingStatus.CANCEL]: { count: 0, totalPrice: 0 },
    };
    const total: BookingStatItemDto = { count: 0, totalPrice: 0 };

    for (const row of rows) {
      const count = Number(row.count) || 0;
      const totalPrice = Number(row.totalPrice) || 0;
      if (byStatus[row.status]) {
        byStatus[row.status] = { count, totalPrice };
      }
      total.count += count;
      total.totalPrice += totalPrice;
    }

    return {
      pending: byStatus[BookingStatus.PENDING],
      paid: byStatus[BookingStatus.PAID],
      cancel: byStatus[BookingStatus.CANCEL],
      total,
    };
  }

  async findPayments(bookingId: string): Promise<BookingPayment[]> {
    const prefix = this.prefix('findPayments', bookingId);

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });
    if (!booking) {
      this.logger.warn(`${prefix} rejected: booking not found`);
      throw new NotFoundException('Booking not found');
    }

    return this.bookingPaymentRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }
}
