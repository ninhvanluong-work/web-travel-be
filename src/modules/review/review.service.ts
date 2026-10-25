import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

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

    private readonly userService: UserService,
    private readonly dataSource: DataSource,
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
    const { userId, ...rest } = payload;
    return await this.getReviews(
      { tourGuideId, ...(userId ? { userId } : {}) },
      rest,
    );
  }

  async createTourGuideReview(
    userId: string | undefined,
    tourGuideId: string,
    payload: CreateReviewDto,
  ) {
    const prefix = this.prefix('createTourGuideReview', tourGuideId);
    this.logger.debug(`${prefix} ${JSON.stringify(payload)}`);

    if (userId) {
      const isExisted = await this.userService.isExisted(userId);
      if (!isExisted) {
        throw new NotFoundException('User not found');
      }
    }

    // tạo user ẩn danh + lưu review + cập nhật điểm tour guide trong cùng 1 transaction
    return this.dataSource.transaction(async (manager) => {
      // khoá dòng tour guide để các review đồng thời tính điểm lần lượt,
      // tránh mất lượt đánh giá khi 2 request cùng đọc ratingCount cũ
      const tourGuide = await manager.findOne(TourGuide, {
        where: { id: tourGuideId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!tourGuide) {
        throw new NotFoundException('Tour guide not found');
      }

      let reviewerId = userId;
      if (!reviewerId) {
        const anonymousUser =
          await this.userService.createAnonymousUser(manager);
        reviewerId = anonymousUser.id;
        this.logger.log(`${prefix} created anonymous user ${reviewerId}`);
      }

      return this.saveTourGuideReview(
        manager,
        tourGuide,
        reviewerId,
        payload,
        prefix,
      );
    });
  }

  private async saveTourGuideReview(
    manager: EntityManager,
    tourGuide: TourGuide,
    reviewerId: string,
    payload: CreateReviewDto,
    prefix: string,
  ) {
    const tourGuideId = tourGuide.id;
    const { tourGuideSubRatings, ...restPayload } = payload;

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

    const review = manager.create(Review, reviewData);
    const savedReview = await manager.save(review);
    this.logger.log(`${prefix} created review ${savedReview.id}`);

    // chỉ cập nhật các cột điểm, không ghi đè các cột khác của tour guide
    await manager.update(TourGuide, tourGuideId, {
      ratingCount: tourGuide.ratingCount,
      ratingValue: tourGuide.ratingValue,
      userReview: tourGuide.userReview,
    });
    this.logger.debug(
      `${prefix} updated tour guide ratings count=${tourGuide.ratingCount} average=${tourGuide.ratingValue}`,
    );

    return savedReview;
  }
}
