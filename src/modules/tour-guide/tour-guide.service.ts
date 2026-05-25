import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetTourGuidesDto } from 'src/modules/tour-guide/dto/get-tour-guide.dto';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class TourGuideService {
  @InjectRepository(TourGuide)
  private readonly tourGuideRepository: Repository<TourGuide>;
  async findAll(
    query: GetTourGuidesDto,
  ): Promise<ListItemsResponse<TourGuide>> {
    const { page = 1, pageSize = 10, keyword = '' } = query;
    const skip = (page - 1) * pageSize;

    const [tourGuides, total] = await this.tourGuideRepository.findAndCount({
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
}
