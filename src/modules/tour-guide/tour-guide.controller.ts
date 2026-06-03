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
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

import { TourGuideService } from 'src/modules/tour-guide/tour-guide.service';

import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import { IdDto } from 'src/types/common.dto';
import { CreateTourGuideDto } from 'src/modules/tour-guide/dto/create-tour-guide.dto';
import { UpdateTourGuideDto } from 'src/modules/tour-guide/dto/update-tour-guide.dto';

import {
  GetTourGuideDetailDto,
  GetTourGuidesDto,
  GetTourGuidesResponseDto,
  TourGuideDto,
} from 'src/modules/tour-guide/dto/get-tour-guide.dto';

@Controller('tour-guide')
@ApiExtraModels(TourGuideDto, GetTourGuidesResponseDto, GetTourGuideDetailDto)
export class TourGuideController {
  constructor(private readonly tourGuideService: TourGuideService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create tour guide',
    schema: {
      properties: {
        data: { $ref: getSchemaRefPath('TourGuideDto') },
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
            $ref: getSchemaRefPath('GetTourGuidesResponseDto'),
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

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get tour guide by id',
    schema: {
      properties: {
        data: { $ref: getSchemaRefPath('GetTourGuideDetailDto') },
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
  @ApiResponse({
    status: 200,
    description: 'update tour guide',
    schema: {
      properties: {
        data: { $ref: getSchemaRefPath('TourGuideDto') },
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
}
