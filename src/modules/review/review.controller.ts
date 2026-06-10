import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { formatApiResponse } from 'src/common/utils/format';

import { Review } from 'src/modules/review/entities/review.entity';
import { ReviewService } from 'src/modules/review/review.service';
import { CreateReviewDto } from 'src/modules/review/dto/create-review.dto';
import { CreateReviewResponseDto } from 'src/modules/review/dto/get-review.dto';

@Controller('review')
@ApiExtraModels(Review, CreateReviewDto, CreateReviewResponseDto)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('tour-guide/:tourGuideId')
  @ApiResponse({
    status: 200,
    description: 'create tour guide review',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(CreateReviewResponseDto),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async createTourGuideReview(
    @Param('tourGuideId') tourGuideId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const result = await this.reviewService.createTourGuideReview(
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
