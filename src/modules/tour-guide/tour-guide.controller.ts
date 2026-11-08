import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { TourGuideService } from 'src/modules/tour-guide/tour-guide.service';
import { ReviewService } from 'src/modules/review/review.service';
import { GetTourGuideReviewsDto } from 'src/modules/review/dto/get-review.dto';
import { GetReviewsResponseDto } from 'src/modules/review/dto/get-review.dto';
import { VideoService } from 'src/modules/video/video.service';
import { CreateVideoDto } from 'src/modules/video/dto/create-video.dto';
import { UpdateMomentDto } from 'src/modules/video/dto/update-video.dto';
import { GetVideoAdminDto } from 'src/modules/video/dto/get-video.dto';
import { Video } from 'src/modules/video/entities/video.entity';

import { formatApiResponse } from 'src/common/utils/format';
import { IdDto } from 'src/types/common.dto';
import { CreateTourGuideDto } from 'src/modules/tour-guide/dto/create-tour-guide.dto';
import { UpdateTourGuideDto } from 'src/modules/tour-guide/dto/update-tour-guide.dto';

import {
  GetTourGuideDetailDto,
  GetTourGuidesDto,
  GetTourGuidesResponseDto,
  TourGuideDto,
} from 'src/modules/tour-guide/dto/get-tour-guide.dto';
import { UpdateTourGuideMomentParamsDto } from 'src/modules/tour-guide/dto/update-tour-guide-moment.dto';
import { USER_TOKEN } from 'src/common/constants';
import tourGuideSkills from 'src/common/constants/tour-guide-skills.json';
import {
  Admin,
  CurrentRole,
  Public,
  TourGuide,
  TourGuideId,
  UserId,
} from 'src/common/decorators';
import { standardResponseSchema } from 'src/common/utils/swagger';

@Controller('tour-guide')
@ApiExtraModels(
  TourGuideDto,
  GetTourGuidesResponseDto,
  GetTourGuideDetailDto,
  GetReviewsResponseDto,
  GetVideoAdminDto,
  Video,
)
export class TourGuideController {
  constructor(
    private readonly tourGuideService: TourGuideService,
    private readonly reviewService: ReviewService,
    private readonly videoService: VideoService,
  ) {}

  @Post()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'create tour guide',
    schema: standardResponseSchema({
      $ref: getSchemaPath('GetTourGuideDetailDto'),
    }),
  })
  async create(@Body() dto: CreateTourGuideDto, @UserId() userId: string) {
    const result = await this.tourGuideService.create(dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created tour guide successfully',
    );
  }

  @Get()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get tour guide list',
    schema: standardResponseSchema({
      type: 'array',
      items: {
        $ref: getSchemaPath('GetTourGuidesResponseDto'),
      },
    }),
  })
  async findAll(@Query() query: GetTourGuidesDto) {
    const result = await this.tourGuideService.findAll(query);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'get tour guide successfully',
    );
  }

  @Get('skills')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get tour guide skill categories',
    schema: standardResponseSchema({ type: 'object' }),
  })
  getSkills() {
    return formatApiResponse(
      tourGuideSkills,
      HttpStatus.OK,
      'get tour guide skills successfully',
    );
  }

  @Get(':id')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get tour guide by id',
    schema: standardResponseSchema({
      $ref: getSchemaPath('GetTourGuideDetailDto'),
    }),
  })
  async findOne(@Param() param: IdDto) {
    const result = await this.tourGuideService.findOneById(param.id);
    if (!result) {
      throw new NotFoundException('Tour guide not found');
    }
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'get tour guide successfully',
    );
  }

  @Put(':id')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'update tour guide',
    schema: standardResponseSchema({ $ref: getSchemaPath('TourGuideDto') }),
  })
  async update(
    @Param() param: IdDto,
    @Body() dto: UpdateTourGuideDto,
    @UserId() userId: string,
    @TourGuideId() tourGuideId: string,
    @CurrentRole() role: string,
  ) {
    this.tourGuideService.assertCanManage(param.id, tourGuideId, role);
    const result = await this.tourGuideService.update(param.id, dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated tour guide successfully',
    );
  }

  @Post('onboarding')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @ApiResponse({
    status: 200,
    description: 'update tour guide onboarding status to true',
    schema: standardResponseSchema({ $ref: getSchemaPath('TourGuideDto') }),
  })
  async onboarding(@TourGuideId() tourGuideId: string) {
    const result = await this.tourGuideService.onboarding(tourGuideId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated tour guide onboarding successfully',
    );
  }

  @Delete(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'delete tour guide',
    schema: standardResponseSchema({ type: 'null', example: null }),
  })
  async remove(@Param() param: IdDto, @UserId() userId: string) {
    await this.tourGuideService.remove(param.id, userId);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'deleted tour guide successfully',
    );
  }

  @Get(':id/review')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get tour guide reviews',
    schema: standardResponseSchema({
      type: 'array',
      items: {
        $ref: getSchemaPath('GetReviewsResponseDto'),
      },
    }),
  })
  async findTourGuideReviews(
    @Param() param: IdDto,
    @Query() query: GetTourGuideReviewsDto,
  ) {
    const result = await this.reviewService.getTourGuideReviews(
      param.id,
      query,
    );
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id/moment')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get video moment list by tour guide id',
    schema: standardResponseSchema({
      type: 'array',
      items: {
        $ref: getSchemaPath('VideoDto'),
      },
    }),
  })
  async findTourGuideMoments(
    @Param() param: IdDto,
    @Query() query: GetVideoAdminDto,
  ) {
    const tourGuide = await this.tourGuideService.findOneById(param.id);
    if (!tourGuide) {
      throw new NotFoundException('Tour guide not found');
    }
    const result = await this.videoService.getTourGuideMoments(param.id, query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Post(':id/moment')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @ApiResponse({
    status: 200,
    description: 'create tour guide moment',
    schema: standardResponseSchema({ $ref: getSchemaPath('Video') }),
  })
  async createTourGuideMoment(
    @Param() param: IdDto,
    @Body() dto: CreateVideoDto,
    @UserId() userId: string,
  ) {
    dto.tourGuideId = param.id;
    const result = await this.videoService.create(dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created moment successfully',
    );
  }

  @Put(':id/moment/:momentId')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @ApiResponse({
    status: 200,
    description: 'update tour guide moment',
    schema: standardResponseSchema({ $ref: getSchemaPath('Video') }),
  })
  async updateTourGuideMoment(
    @Param() param: UpdateTourGuideMomentParamsDto,
    @Body() dto: UpdateMomentDto,
    @UserId() userId: string,
  ) {
    const { id, momentId } = param;
    const result = await this.videoService.updateMoment(
      momentId,
      id,
      dto,
      userId,
    );
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated moment successfully',
    );
  }

  @Delete(':id/moment/:momentId')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'delete tour guide moment',
    schema: standardResponseSchema({ type: 'null', example: null }),
  })
  async deleteTourGuideMoment(
    @Param() param: UpdateTourGuideMomentParamsDto,
    @TourGuideId() tourGuideId: string,
    @CurrentRole() role: string,
  ) {
    const { id, momentId } = param;
    this.tourGuideService.assertCanManage(id, tourGuideId, role);
    await this.videoService.removeMoment(momentId, id);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'deleted moment successfully',
    );
  }
}
