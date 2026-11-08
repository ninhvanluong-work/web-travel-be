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
import { Admin, Public, UserId } from 'src/common/decorators';
import { USER_TOKEN } from 'src/common/constants';
import { standardResponseSchema } from 'src/common/utils/swagger';

@Controller('session')
@ApiExtraModels(SessionDto, GetSessionsResponseDto)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'create session',
    schema: standardResponseSchema({ $ref: getSchemaPath('SessionDto') }),
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
  @ApiResponse({
    status: 200,
    description: 'create sessions for 1 or multiple consecutive days',
    schema: standardResponseSchema({
      type: 'array',
      items: { $ref: getSchemaPath('SessionDto') },
    }),
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
  @Public()
  @ApiResponse({
    status: 200,
    description: 'list sessions',
    schema: standardResponseSchema({
      $ref: getSchemaPath('GetSessionsResponseDto'),
    }),
  })
  async list(@Query() query: GetSessionDto) {
    const result = await this.sessionService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get session detail',
    schema: standardResponseSchema({ $ref: getSchemaPath('SessionDto') }),
  })
  async findOne(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.sessionService.findOneById(id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
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
