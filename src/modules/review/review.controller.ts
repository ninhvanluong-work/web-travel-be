import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { Review } from 'src/modules/review/entities/review.entity';
import { CreateReviewDto } from 'src/modules/review/dto/create-review.dto';
import { CreateReviewResponseDto } from 'src/modules/review/dto/get-review.dto';

import { ReviewService } from 'src/modules/review/review.service';
import { formatApiResponse } from 'src/common/utils/format';

import { OptionalAuth, UserId } from 'src/common/decorators';
import { USER_TOKEN } from 'src/common/constants';
import { standardResponseSchema } from 'src/common/utils/swagger';

@Controller('review')
@ApiExtraModels(Review, CreateReviewDto, CreateReviewResponseDto)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('tour-guide/:tourGuideId')
  @ApiBearerAuth(USER_TOKEN)
  @OptionalAuth()
  @ApiResponse({
    status: 200,
    description: 'create tour guide review',
    schema: standardResponseSchema({
      $ref: getSchemaPath(CreateReviewResponseDto),
    }),
  })
  async createTourGuideReview(
    @Param('tourGuideId') tourGuideId: string,
    @Body() dto: CreateReviewDto,
    @UserId() userId: string | undefined,
  ) {
    const result = await this.reviewService.createTourGuideReview(
      userId,
      tourGuideId,
      dto,
    );

    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created tour guide review successfully',
    );
  }
}
