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
  UseGuards,
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
import { UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';
import tourGuideSkills from 'src/common/constants/tour-guide-skills.json';
import { TourGuide, TourGuideId } from 'src/common/decorators';

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
  @ApiResponse({
    status: 200,
    description: 'create tour guide',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetTourGuideDetailDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateTourGuideDto) {
    const result = await this.tourGuideService.create(dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created tour guide successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get tour guide list',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath('GetTourGuidesResponseDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
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
  @ApiResponse({
    status: 200,
    description: 'get tour guide skill categories',
    schema: {
      properties: {
        data: { type: 'object' },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  getSkills() {
    return formatApiResponse(
      tourGuideSkills,
      HttpStatus.OK,
      'get tour guide skills successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get tour guide by id',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetTourGuideDetailDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
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
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'update tour guide',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TourGuideDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async update(@Param() param: IdDto, @Body() dto: UpdateTourGuideDto) {
    const result = await this.tourGuideService.update(param.id, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated tour guide successfully',
    );
  }

  @Post('onboarding')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'update tour guide onboarding status to true',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TourGuideDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
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
  @ApiResponse({
    status: 200,
    description: 'delete tour guide',
    schema: {
      properties: {
        data: { type: 'null', example: null },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async remove(@Param() param: IdDto) {
    await this.tourGuideService.remove(param.id);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'deleted tour guide successfully',
    );
  }

  @Get(':id/review')
  @ApiResponse({
    status: 200,
    description: 'get tour guide reviews',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath('GetReviewsResponseDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
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
  @ApiResponse({
    status: 200,
    description: 'get video moment list by tour guide id',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath('VideoDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
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
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'create tour guide moment',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('Video') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async createTourGuideMoment(
    @Param() param: IdDto,
    @Body() dto: CreateVideoDto,
  ) {
    dto.tourGuideId = param.id;
    const result = await this.videoService.create(dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created moment successfully',
    );
  }

  @Put(':id/moment/:momentId')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'update tour guide moment',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('Video') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async updateTourGuideMoment(
    @Param() param: UpdateTourGuideMomentParamsDto,
    @Body() dto: UpdateMomentDto,
  ) {
    const { id, momentId } = param;
    const result = await this.videoService.updateMoment(momentId, id, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated moment successfully',
    );
  }

  @Delete(':id/moment/:momentId')
  @ApiBearerAuth(USER_TOKEN)
  @TourGuide()
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'delete tour guide moment',
    schema: {
      properties: {
        data: { type: 'null', example: null },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async deleteTourGuideMoment(@Param('momentId') momentId: string) {
    await this.videoService.remove(momentId);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'deleted moment successfully',
    );
  }
}
