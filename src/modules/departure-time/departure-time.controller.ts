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

import { DepartureTimeService } from './departure-time.service';
import { CreateDepartureTimeDto } from './dto/create-departure-time.dto';
import { UpdateDepartureTimeDto } from './dto/update-departure-time.dto';
import { GetDepartureTimeDto } from './dto/get-departure-time.dto';
import { DepartureTimeDto } from './dto/departure-time-response.dto';
import { IdDto } from 'src/types/common.dto';
import { formatApiResponse } from 'src/common/utils/format';
import { Admin, Public, UserId } from 'src/common/decorators';
import { USER_TOKEN } from 'src/common/constants';
import { standardResponseSchema } from 'src/common/utils/swagger';

@Controller('departure-time')
@ApiExtraModels(DepartureTimeDto)
export class DepartureTimeController {
  constructor(private readonly departureTimeService: DepartureTimeService) {}

  @Post()
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'create departure time',
    schema: standardResponseSchema({ $ref: getSchemaPath('DepartureTimeDto') }),
  })
  async create(@Body() dto: CreateDepartureTimeDto, @UserId() userId: string) {
    const result = await this.departureTimeService.create(dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created departure time successfully',
    );
  }

  @Get()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'list departure times of a product',
    schema: standardResponseSchema({
      type: 'array',
      items: { $ref: getSchemaPath('DepartureTimeDto') },
    }),
  })
  async list(@Query() query: GetDepartureTimeDto) {
    const result = await this.departureTimeService.findByProduct(
      query.productId,
    );
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get departure time detail',
    schema: standardResponseSchema({ $ref: getSchemaPath('DepartureTimeDto') }),
  })
  async findOne(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.departureTimeService.findOneById(id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'update departure time',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('DepartureTimeDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'updated departure time successfully',
        },
      },
    },
  })
  async update(
    @Param() param: IdDto,
    @Body() dto: UpdateDepartureTimeDto,
    @UserId() userId: string,
  ) {
    const { id } = param;
    const result = await this.departureTimeService.update(id, dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated departure time successfully',
    );
  }

  @Delete(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'delete departure time',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('DepartureTimeDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'deleted departure time successfully',
        },
      },
    },
  })
  async remove(@Param() param: IdDto, @UserId() userId: string) {
    const { id } = param;
    const result = await this.departureTimeService.remove(id, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deleted departure time successfully',
    );
  }
}
