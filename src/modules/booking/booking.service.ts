import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  TourSession,
  TourSessionStatus,
} from 'src/modules/tour-session/entities/tour-session.entity';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { UnitReference } from 'src/modules/unit-reference/entities/unit-reference.entity';
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
    @InjectRepository(TourSession)
    private readonly tourSessionRepository: Repository<TourSession>,
    @InjectRepository(PickupLocation)
    private readonly pickupLocationRepository: Repository<PickupLocation>,
    @InjectRepository(UnitReference)
    private readonly unitReferenceRepository: Repository<UnitReference>,
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

    const tourSession = await this.tourSessionRepository.findOne({
      where: { id: payload.tourSessionId, optionId: payload.optionId },
    });
    if (!tourSession) {
      this.logger.warn(
        `${prefix} rejected: tour session ${payload.tourSessionId} not found for option ${payload.optionId}`,
      );
      throw new NotFoundException('Tour session not found');
    }
    if (tourSession.status !== TourSessionStatus.ACTIVE) {
      this.logger.warn(
        `${prefix} rejected: tour session ${tourSession.id} status is ${tourSession.status}`,
      );
      throw new BadRequestException('Tour session is not active');
    }

    let pickupLocation: PickupLocation | null = null;
    if (payload.pickupLocationId) {
      pickupLocation = await this.pickupLocationRepository.findOne({
        where: { id: payload.pickupLocationId, optionId: payload.optionId },
      });
      if (!pickupLocation) {
        this.logger.warn(
          `${prefix} rejected: pickup location ${payload.pickupLocationId} not found for option ${payload.optionId}`,
        );
        throw new NotFoundException('Pickup location not found');
      }
    }

    let departure: DepartureTime | null = null;
    if (payload.departureId) {
      departure = await this.departureTimeRepository.findOne({
        where: { id: payload.departureId, optionId: payload.optionId },
      });
      if (!departure) {
        this.logger.warn(
          `${prefix} rejected: departure time ${payload.departureId} not found for option ${payload.optionId}`,
        );
        throw new NotFoundException('Departure time not found');
      }
    }

    const unitReferences = await this.unitReferenceRepository.find({
      where: { tourSessionId: payload.tourSessionId },
    });
    const unitReferenceMap = new Map(
      unitReferences.map((unit) => [unit.id, unit]),
    );

    let totalCount = 0;
    let totalPrice = 0;
    const passengers: BookingPassenger[] = payload.passengers.map(
      (passenger) => {
        const unit = unitReferenceMap.get(passenger.unitId);
        if (!unit) {
          this.logger.warn(
            `${prefix} rejected: unit ${passenger.unitId} not available for tour session ${tourSession.id}`,
          );
          throw new BadRequestException(
            `Unit ${passenger.unitId} is not available for this tour session`,
          );
        }
        totalCount += passenger.count;
        totalPrice += Number(unit.price) * passenger.count;
        return {
          unitId: unit.id,
          unitName: unit.name,
          price: Number(unit.price),
          count: passenger.count,
        };
      },
    );

    this.logger.debug(
      `${prefix} snapshot passengers=${JSON.stringify(passengers)} totalCount=${totalCount} totalPrice=${totalPrice}`,
    );

    if (tourSession.remainingSlot < totalCount) {
      this.logger.warn(
        `${prefix} rejected: not enough remaining slot (remaining=${tourSession.remainingSlot}, requested=${totalCount})`,
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
      bookingDate: new Date(),
      travelDate: tourSession.travelDate,
      passengers,
      totalPrice,
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

    tourSession.remainingSlot -= totalCount;
    await this.tourSessionRepository.save(tourSession);
    this.logger.debug(
      `${this.prefix('create', tourSession.id)} remainingSlot ${tourSession.remainingSlot + totalCount} -> ${tourSession.remainingSlot}`,
    );

    return savedBooking;
  }
}
