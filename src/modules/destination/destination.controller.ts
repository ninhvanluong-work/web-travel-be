import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { formatApiResponse } from 'src/common/utils/format';
import { IdDto } from 'src/types/common.dto';
import { Admin, UserId } from 'src/common/decorators';
import { UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

import { DestinationService } from './destination.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import {
  GetDestinationDto,
  GetDestinationsResponseDto,
} from './dto/get-destination.dto';
import { DestinationDto } from './dto/destination-response.dto';

@Controller('destination')
@ApiExtraModels(DestinationDto, GetDestinationsResponseDto)
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Post()
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'create destination',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('DestinationDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'created destination successfully',
        },
      },
    },
  })
  async create(@Body() dto: CreateDestinationDto, @UserId() userId: string) {
    const result = await this.destinationService.create(dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created destination successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'list destinations',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetDestinationsResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetDestinationDto) {
    const result = await this.destinationService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'destination detail',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('DestinationDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const result = await this.destinationService.findOneById(param.id);
    if (!result) throw new NotFoundException('Destination not found');
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'update destination',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('DestinationDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'updated destination successfully',
        },
      },
    },
  })
  async update(
    @Param() param: IdDto,
    @Body() dto: UpdateDestinationDto,
    @UserId() userId: string,
  ) {
    const result = await this.destinationService.update(param.id, dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated destination successfully',
    );
  }

  @Delete(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'delete destination (soft delete)',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('DestinationDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: {
          type: 'string',
          example: 'deleted destination successfully',
        },
      },
    },
  })
  async remove(@Param() param: IdDto, @UserId() userId: string) {
    const result = await this.destinationService.remove(param.id, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deleted destination successfully',
    );
  }
}
