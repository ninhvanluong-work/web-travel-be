import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { Review } from 'src/modules/review/entities/review.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { RatingItemDto } from 'src/modules/tour-guide/dto/review-rating.dto';
import { CreateReviewDto } from 'src/modules/review/dto/create-review.dto';
import {
  GetProductReviewsDto,
  GetReviewsDto,
  GetTourGuideReviewsDto,
} from 'src/modules/review/dto/get-review.dto';
import { PaginationResponse } from 'src/types/pagination.dto';

import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class ReviewService {
  private logger = new Logger(ReviewService.name);

  private prefix(context: string, id?: string): string {
    return `[ReviewService:${context}]${id ? ' ' + id : ''}`;
  }

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(TourGuide)
    private readonly tourGuideRepository: Repository<TourGuide>,

    private readonly userService: UserService,
  ) {}

  private calculateAverage(
    currentAverage: number,
    currentCount: number,
    newRating: number,
  ): number {
    return (currentAverage * currentCount + newRating) / (currentCount + 1);
  }

  private updateGuideSubRatings(
    currentRatings: RatingItemDto[],
    newRatings: RatingItemDto[] | undefined,
    currentCount: number,
  ): RatingItemDto[] {
    if (!newRatings || newRatings.length === 0) {
      return currentRatings || [];
    }

    const ratingsMap = new Map(newRatings.map((item) => [item.key, item]));
    const baseRatings =
      currentRatings && currentRatings.length ? currentRatings : newRatings;
    return baseRatings.map((item) => {
      const newRating = ratingsMap.get(item.key);
      if (!newRating) {
        return item;
      }
      return {
        ...item,
        value: this.calculateAverage(
          item.value ?? 0,
          currentCount,
          newRating.value,
        ),
      };
    });
  }

  async getReviews(
    condition:
      | FindOptionsWhere<Review>
      | FindOptionsWhere<Review>[]
      | undefined,
    payload: GetReviewsDto,
  ) {
    const { page = 1, pageSize = 10 } = payload;
    const skip = (page - 1) * pageSize;
    const prefix = this.prefix('getReviews');
    this.logger.debug(
      `${prefix} condition=${JSON.stringify(condition)} payload=${JSON.stringify(payload)}`,
    );

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

    this.logger.log(
      `${prefix} returning ${reviews.length} items (total ${total})`,
    );

    return {
      items: reviews,
      pagination,
    };
  }

  async getProductReviews(productId: string, payload: GetProductReviewsDto) {
    const prefix = this.prefix('getProductReviews', productId);
    this.logger.debug(`${prefix} payload=${JSON.stringify(payload)}`);
    return await this.getReviews({ productId }, payload);
  }

  async getTourGuideReviews(
    tourGuideId: string,
    payload: GetTourGuideReviewsDto,
  ) {
    const prefix = this.prefix('getTourGuideReviews', tourGuideId);
    this.logger.debug(`${prefix} payload=${JSON.stringify(payload)}`);
    return await this.getReviews({ tourGuideId }, payload);
  }

  async createTourGuideReview(
    userId: string | undefined,
    tourGuideId: string,
    payload: CreateReviewDto,
  ) {
    const tourGuide = await this.tourGuideRepository.findOne({
      where: { id: tourGuideId },
    });

    if (!tourGuide) {
      throw new NotFoundException('Tour guide not found');
    }

    const prefix = this.prefix('createTourGuideReview', tourGuideId);
    this.logger.debug(`${prefix} ${JSON.stringify(payload)}`);

    const { tourGuideSubRatings, ...restPayload } = payload;

    let reviewerId = userId;
    if (!reviewerId) {
      const anonymousUser = await this.userService.createAnonymousUser();
      reviewerId = anonymousUser.id;
      this.logger.log(`${prefix} created anonymous user ${reviewerId}`);
    } else {
      const isExisted = await this.userService.isExisted(reviewerId);
      if (!isExisted) {
        throw new NotFoundException('User not found');
      }
    }

    this.logger.log(`${prefix} creating review`);
    const reviewData: Partial<Review> = {
      ...restPayload,
      tourGuideId,
      userId: reviewerId,
    };

    if (tourGuideSubRatings) {
      reviewData.metadata = {
        ...reviewData.metadata,
        guide: tourGuideSubRatings,
      };
    }

    //calculate tour-guide rating
    const existingCount = tourGuide.ratingCount ?? 0;
    const existingAverage = tourGuide.ratingValue ?? 0;
    const newRatingCount = existingCount + 1;
    const newRatingAverage = this.calculateAverage(
      existingAverage,
      existingCount,
      payload.point,
    );

    tourGuide.ratingCount = newRatingCount;
    tourGuide.ratingValue = newRatingAverage;

    const existingUserReview = tourGuide.userReview || {
      reviewCount: 0,
      reviewValue: 0,
      ratings: [],
    };
    const currentReviewCount = existingUserReview.reviewCount ?? 0;
    const updatedUserReviewRatings = this.updateGuideSubRatings(
      existingUserReview.ratings,
      tourGuideSubRatings,
      currentReviewCount,
    );

    tourGuide.userReview = {
      ...existingUserReview,
      reviewCount: currentReviewCount + 1,
      reviewValue: this.calculateAverage(
        existingUserReview.reviewValue ?? 0,
        currentReviewCount,
        payload.point,
      ),
      ratings: updatedUserReviewRatings,
    };

    await this.tourGuideRepository.save(tourGuide);
    this.logger.debug(
      `${prefix} updated tour guide ratings count=${tourGuide.ratingCount} average=${tourGuide.ratingValue}`,
    );

    const review = this.reviewRepository.create(reviewData);
    const savedReview = await this.reviewRepository.save(review);
    this.logger.log(`${prefix} created review ${savedReview.id}`);

    return savedReview;
  }
}
