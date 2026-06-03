import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

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
  ) {}

  async create(payload: CreateTourGuideDto) {
    const tourGuide = this.tourGuideRepository.create(payload);
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
    return this.tourGuideRepository.findOne({
      where: { id },
      withDeleted,
    });
  }

  async update(id: string, payload: UpdateTourGuideDto) {
    const tourGuide = await this.findOneById(id);
    if (!tourGuide) {
      throw new NotFoundException('Tour guide not found');
    }

    Object.assign(tourGuide, payload);
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
