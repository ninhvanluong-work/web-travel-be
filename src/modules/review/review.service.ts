import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { Review } from 'src/modules/review/entities/review.entity';

import {
  GetProductReviewsDto,
  GetReviewsDto,
  GetTourGuideReviewsDto,
} from 'src/modules/review/dto/get-review.dto';
import { PaginationResponse } from 'src/types/pagination.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getReviews(
    condition:
      | FindOptionsWhere<Review>
      | FindOptionsWhere<Review>[]
      | undefined,
    payload: GetReviewsDto,
  ) {
    const { page = 1, pageSize = 10 } = payload;
    const skip = (page - 1) * pageSize;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: condition,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        comment: true,
        point: true,
        images: true,
        user: {
          id: true,
          name: true,
        },
      },
      relations: {
        user: true,
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
      items: reviews,
      pagination,
    };
  }

  async getProductReviews(productId: string, payload: GetProductReviewsDto) {
    return await this.getReviews({ productId }, payload);
  }

  async getTourGuideReviews(
    tourGuideId: string,
    payload: GetTourGuideReviewsDto,
  ) {
    return await this.getReviews({ tourGuideId }, payload);
  }
}
