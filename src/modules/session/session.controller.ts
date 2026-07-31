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

import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GetSessionDto, GetSessionsResponseDto } from './dto/get-session.dto';
import { SessionDto } from './dto/session-response.dto';
import { IdDto } from 'src/types/common.dto';
import { formatApiResponse } from 'src/common/utils/format';

@Controller('session')
@ApiExtraModels(SessionDto, GetSessionsResponseDto)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create session',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('SessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateSessionDto) {
    const result = await this.sessionService.create(dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created session successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'list sessions',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetSessionsResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async list(@Query() query: GetSessionDto) {
    const result = await this.sessionService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get session detail',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('SessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.sessionService.findOneById(id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update session',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('SessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'updated session successfully',
        },
      },
    },
  })
  async update(@Param() param: IdDto, @Body() dto: UpdateSessionDto) {
    const { id } = param;
    const result = await this.sessionService.update(id, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated session successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'delete session',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('SessionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'deleted session successfully',
        },
      },
    },
  })
  async remove(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.sessionService.remove(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deleted session successfully',
    );
  }
}
