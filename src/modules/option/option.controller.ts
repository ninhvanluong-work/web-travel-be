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

import { OptionService } from './option.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { GetOptionDto, GetOptionsResponseDto } from './dto/get-option.dto';
import { OptionDto } from './dto/option-response.dto';
import { IdDto } from 'src/types/common.dto';
import { formatApiResponse } from 'src/common/utils/format';

@Controller('option')
@ApiExtraModels(OptionDto, GetOptionsResponseDto)
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  //@Post()
  @ApiResponse({
    status: 200,
    description: 'create option',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('OptionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateOptionDto) {
    const result = await this.optionService.create(dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created option successfully',
    );
  }

  //@Get()
  @ApiResponse({
    status: 200,
    description: 'list options',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetOptionsResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async list(@Query() query: GetOptionDto) {
    const result = await this.optionService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get option detail',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('OptionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.optionService.findOneById(id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update option',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('OptionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'updated option successfully' },
      },
    },
  })
  async update(@Param() param: IdDto, @Body() dto: UpdateOptionDto) {
    const { id } = param;
    const result = await this.optionService.update(id, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated option successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'delete option',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('OptionDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'deleted option successfully' },
      },
    },
  })
  async remove(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.optionService.remove(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deleted option successfully',
    );
  }
}
