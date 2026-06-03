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

import { ElementService } from 'src/modules/element/element.service';

import { CreateElementDto } from './dto/create-element.dto';

import { UpdateElementDto } from './dto/update-element.dto';
import { IdDto } from 'src/types/common.dto';
import { formatApiResponse } from 'src/common/utils/format';
import { GetElementDto } from './dto/get-element.dto';
import { ElementDto } from './dto/element-response.dto';

@Controller('element')
@ApiExtraModels(ElementDto)
export class ElementController {
  constructor(private readonly elementService: ElementService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create element',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('ElementDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateElementDto) {
    const result = await this.elementService.create(dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created element successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'list elements',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath('ElementDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async list(@Query() query: GetElementDto) {
    const result = await this.elementService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'UPDATE element',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('ElementDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'updated element successfully' },
      },
    },
  })
  async update(@Param() param: IdDto, @Body() dto: UpdateElementDto) {
    const { id } = param;
    const result = await this.elementService.update(id, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated element successfully',
    );
  }

  @Put(':id/active')
  @ApiResponse({
    status: 200,
    description: 'UPDATE element',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('ElementDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'activated element successfully' },
      },
    },
  })
  async activate(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.elementService.activate(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'activated element successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'deactivate element',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('ElementDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'deactivate element successfully' },
      },
    },
  })
  async remove(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.elementService.remove(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deactivate element successfully',
    );
  }
}
