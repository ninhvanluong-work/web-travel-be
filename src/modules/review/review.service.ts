import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from 'src/modules/review/entities/review.entity';

import { GetProductReviewsDto } from 'src/modules/review/dto/get-review.dto';
import { PaginationResponse } from 'src/types/pagination.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getProductReviews(productId, payload: GetProductReviewsDto) {
    const { page = 1, pageSize = 10 } = payload;
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: {
        productId,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        comment: true,
        point: true,
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
}
