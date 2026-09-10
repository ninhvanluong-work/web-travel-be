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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateSessionRangeDto } from './dto/create-session-range.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GetSessionDto, GetSessionsResponseDto } from './dto/get-session.dto';
import { SessionDto } from './dto/session-response.dto';
import { IdDto } from 'src/types/common.dto';
import { formatApiResponse } from 'src/common/utils/format';
import { Admin, UserId } from 'src/common/decorators';
import { UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

@Controller('session')
@ApiExtraModels(SessionDto, GetSessionsResponseDto)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
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
  async create(@Body() dto: CreateSessionDto, @UserId() userId: string) {
    const result = await this.sessionService.create(dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created session successfully',
    );
  }

  @Post('range')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'create sessions for 1 or multiple consecutive days',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath('SessionDto') } },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async createRange(
    @Body() dto: CreateSessionRangeDto,
    @UserId() userId: string,
  ) {
    const result = await this.sessionService.createRange(dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created sessions successfully',
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
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
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
  async update(
    @Param() param: IdDto,
    @Body() dto: UpdateSessionDto,
    @UserId() userId: string,
  ) {
    const { id } = param;
    const result = await this.sessionService.update(id, dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated session successfully',
    );
  }

  @Delete(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
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
  async remove(@Param() param: IdDto, @UserId() userId: string) {
    const { id } = param;
    const result = await this.sessionService.remove(id, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deleted session successfully',
    );
  }
}
