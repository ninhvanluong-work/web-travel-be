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
} from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { formatApiResponse } from 'src/common/utils/format';
import { IdDto } from 'src/types/common.dto';

import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetTagDto, GetTagsResponseDto } from './dto/get-tag.dto';
import { TagDto } from './dto/tag-response.dto';

@Controller('tag')
@ApiExtraModels(TagDto, GetTagsResponseDto)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create tag',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TagDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateTagDto) {
    const result = await this.tagService.create(dto);
    return formatApiResponse(result, HttpStatus.OK, 'created tag successfully');
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'list tags',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath('GetTagsResponseDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetTagDto) {
    const result = await this.tagService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update tag',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TagDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'updated tag successfully' },
      },
    },
  })
  async update(@Param() param: IdDto, @Body() dto: UpdateTagDto) {
    const { id } = param;
    const result = await this.tagService.update(id, dto);
    return formatApiResponse(result, HttpStatus.OK, 'updated tag successfully');
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'deactivate tag',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('TagDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'deactivated tag successfully' },
      },
    },
  })
  async remove(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.tagService.remove(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deactivated tag successfully',
    );
  }
}
