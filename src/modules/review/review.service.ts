import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { Review } from 'src/modules/review/entities/review.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { User } from 'src/modules/user/entities/user.entity';

import { CreateReviewDto } from 'src/modules/review/dto/create-review.dto';
import {
  GetProductReviewsDto,
  GetReviewsDto,
  GetTourGuideReviewsDto,
} from 'src/modules/review/dto/get-review.dto';
import { PaginationResponse } from 'src/types/pagination.dto';

@Injectable()
export class ReviewService {
  private logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(TourGuide)
    private readonly tourGuideRepository: Repository<TourGuide>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
        videos: true,
        metadata: true,
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

  async createTourGuideReview(tourGuideId: string, payload: CreateReviewDto) {
    const tourGuide = await this.tourGuideRepository.findOne({
      where: { id: tourGuideId },
    });

    if (!tourGuide) {
      throw new NotFoundException('Tour guide not found');
    }

    const prefixLog = `[createTourGuideReview] ${tourGuideId}`;
    this.logger.debug(`${prefixLog} ${JSON.stringify(payload)}`);

    const { tourGuideSubRatings, ...restPayload } = payload;
    console.log(tourGuideSubRatings);
    const user = this.userRepository.create({
      name: 'Review user',
    });
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`${prefixLog} creating review`);
    const reviewData: Partial<Review> = {
      ...restPayload,
      tourGuideId,
      user: savedUser,
    };

    if (tourGuideSubRatings) {
      reviewData.metadata = {
        ...reviewData.metadata,
        guide: tourGuideSubRatings,
      };
    }

    const review = this.reviewRepository.create(reviewData);

    return await this.reviewRepository.save(review);
  }
}
