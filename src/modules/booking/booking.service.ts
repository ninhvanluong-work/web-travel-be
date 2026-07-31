import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import {
  Booking,
  BookingPassenger,
  BookingStatus,
} from 'src/modules/booking/entities/booking.entity';
import { CreateBookingDto } from 'src/modules/booking/dto/create-booking.dto';
import { Product } from 'src/modules/product/entities/product.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import {
  Session,
  SessionStatus,
} from 'src/modules/session/entities/session.entity';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';
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
      where: { id: In(unitIds), productId: payload.productId },
    });
    const unitMap = new Map(units.map((unit) => [unit.id, unit]));

    let totalCount = 0;
    // price is not sourced from Unit anymore (unit no longer carries price/capacity);
    // pricing design is pending, so snapshot price stays 0 for now.
    const totalPrice = 0;
    const passengers: BookingPassenger[] = payload.passengers.map(
      (passenger) => {
        const unit = unitMap.get(passenger.unitId);
        if (!unit) {
          this.logger.warn(
            `${prefix} rejected: unit ${passenger.unitId} not found`,
          );
          throw new BadRequestException(`Unit ${passenger.unitId} not found`);
        }
        totalCount += passenger.count;
        return {
          unitId: unit.id,
          unitName: unit.name,
          price: 0,
          count: passenger.count,
        };
      },
    );

    this.logger.debug(
      `${prefix} snapshot passengers=${JSON.stringify(passengers)} totalCount=${totalCount} totalPrice=${totalPrice}`,
    );

    if (session.capacity < totalCount) {
      this.logger.warn(
        `${prefix} rejected: not enough capacity (remaining=${session.capacity}, requested=${totalCount})`,
      );
      throw new BadRequestException('Not enough remaining slot');
    }

    const booking = this.bookingRepository.create({
      userId,
      productId: payload.productId,
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
      productName: product.name,
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
}
