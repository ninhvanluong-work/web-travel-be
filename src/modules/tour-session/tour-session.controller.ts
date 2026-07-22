import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { TourSessionService } from './tour-session.service';
import { CreateTourSessionDto } from './dto/create-tour-session.dto';
import { UpdateTourSessionDto } from './dto/update-tour-session.dto';
import {
  GetTourSessionDto,
  GetTourSessionsResponseDto,
} from './dto/get-tour-session.dto';
import { TourSessionDto } from './dto/tour-session-response.dto';
import { IdDto } from 'src/types/common.dto';
import { formatApiResponse } from 'src/common/utils/format';

@Controller('tour-session')
@ApiExtraModels(TourSessionDto, GetTourSessionsResponseDto)
export class TourSessionController {
  constructor(private readonly tourSessionService: TourSessionService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create tour session',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TourSessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateTourSessionDto) {
    const result = await this.tourSessionService.create(dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created tour session successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'list tour sessions',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetTourSessionsResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async list(@Query() query: GetTourSessionDto) {
    const result = await this.tourSessionService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get tour session detail',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TourSessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.tourSessionService.findOneById(id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update tour session',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TourSessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'updated tour session successfully',
        },
      },
    },
  })
  async update(@Param() param: IdDto, @Body() dto: UpdateTourSessionDto) {
    const { id } = param;
    const result = await this.tourSessionService.update(id, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated tour session successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'delete tour session',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TourSessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'deleted tour session successfully',
        },
      },
    },
  })
  async remove(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.tourSessionService.remove(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deleted tour session successfully',
    );
  }
}
