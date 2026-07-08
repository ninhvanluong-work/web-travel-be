import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { generateRandomCode } from 'src/common/utils/gen-code';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { CreateTourGuideDto } from 'src/modules/tour-guide/dto/create-tour-guide.dto';
import { GetTourGuidesDto } from 'src/modules/tour-guide/dto/get-tour-guide.dto';
import { UpdateTourGuideDto } from 'src/modules/tour-guide/dto/update-tour-guide.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

@Injectable()
export class TourGuideService {
  constructor(
    @InjectRepository(TourGuide)
    private readonly tourGuideRepository: Repository<TourGuide>,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
  ) {}

  async create(payload: CreateTourGuideDto) {
    if (payload.locationId) {
      const destination = await this.destinationRepository.findOne({
        where: { id: payload.locationId },
      });
      if (!destination) {
        throw new NotFoundException('Destination not found');
      }
    }
    //generate ref - code
    let refCode = generateRandomCode(8);
    let existed = await this.tourGuideRepository.findOne({
      where: { refCode },
    });
    while (existed) {
      refCode = generateRandomCode(8);
      existed = await this.tourGuideRepository.findOne({
        where: { refCode },
      });
    }

    const tourGuide = this.tourGuideRepository.create({
      ...payload,
      refCode,
    });
    return this.tourGuideRepository.save(tourGuide);
  }

  async findAll(
    query: GetTourGuidesDto,
  ): Promise<ListItemsResponse<TourGuide>> {
    const { page = 1, pageSize = 10, keyword = '' } = query;
    const skip = (page - 1) * pageSize;

    const [tourGuides, total] = await this.tourGuideRepository.findAndCount({
      select: {
        id: true,
        createdAt: true,
        name: true,
        avatar: true,
        ratingCount: true,
        ratingValue: true,
        expYear: true,
      },
      where: {
        name: ILike(`%${keyword}%`),
      },
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

    return {
      items: tourGuides,
      pagination,
    };
  }

  async findOneById(id: string, withDeleted = false) {
    const tourGuide = await this.tourGuideRepository.findOne({
      where: { id },
      relations: ['products', 'products.destination', 'location'],
      withDeleted,
    });

    if (!tourGuide) {
      return null;
    }

    let destinationSummary: {
      destinationId: string;
      destinationName: string;
      productCount: number;
    }[] = [];
    let totalProducts = 0;
    // Group products by destination and count them
    const destinationMap = new Map<
      string,
      { destinationId: string; destinationName: string; productCount: number }
    >();

    if (tourGuide.products && tourGuide.products.length > 0) {
      totalProducts = tourGuide.products?.length || 0;

      tourGuide.products.forEach((product) => {
        if (product.destination) {
          const key = product.destination.id;
          if (!destinationMap.has(key)) {
            destinationMap.set(key, {
              destinationId: product.destination.id,
              destinationName: product.destination.name,
              productCount: 0,
            });
          }
          const dest = destinationMap.get(key)!;
          dest.productCount += 1;
        }
      });
      destinationSummary = Array.from(destinationMap.values()).sort(
        (a, b) => a.productCount - b.productCount,
      );
    }

    // Create response with destination summary (exclude products to avoid large payload)
    const { products, ...tourGuideWithoutProducts } = tourGuide as any;

    return {
      ...tourGuideWithoutProducts,
      destinationSummary,
      totalProducts,
    };
  }

  async update(id: string, payload: UpdateTourGuideDto) {
    const tourGuide = await this.findOneById(id);
    if (!tourGuide) {
      throw new NotFoundException('Tour guide not found');
    }

    if (payload.locationId) {
      const destination = await this.destinationRepository.findOne({
        where: { id: payload.locationId },
      });
      if (!destination) {
        throw new NotFoundException('Destination not found');
      }
    }

    Object.assign(tourGuide, payload);
    return this.tourGuideRepository.save(tourGuide);
  }

  async onboarding(id: string) {
    const tourGuide = await this.tourGuideRepository.findOne({
      where: { id },
    });
    if (!tourGuide) {
      throw new NotFoundException('Tour guide not found');
    }

    tourGuide.onboarding = true;
    return this.tourGuideRepository.save(tourGuide);
  }

  async remove(id: string) {
    const tourGuide = await this.findOneById(id);
    if (!tourGuide) {
      throw new NotFoundException('Tour guide not found');
    }

    await this.tourGuideRepository.softDelete(id);

    return tourGuide;
  }
}
