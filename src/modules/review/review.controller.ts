import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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

import { UserId } from 'src/common/decorators';
import { OptionalUserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

@Controller('review')
@ApiExtraModels(Review, CreateReviewDto, CreateReviewResponseDto)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('tour-guide/:tourGuideId')
  @ApiBearerAuth(USER_TOKEN)
  @UseGuards(OptionalUserGuard)
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
