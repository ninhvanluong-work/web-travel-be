import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  Put,
} from '@nestjs/common';

import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import {
  GetVideoDto,
  GetVideoResponseDto,
} from 'src/modules/video/dto/get-video.dto';
import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import { Video } from 'src/modules/video/entities/video.entity';

@Controller('video')
@ApiExtraModels(GetVideoDto, GetVideoResponseDto, Video)
export class VideoController {
  constructor(private readonly videosService: VideoService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get list video',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaRefPath('GetVideoResponseDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetVideoDto) {
    const result = await this.videosService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':slug')
  @ApiResponse({
    status: 200,
    description: 'get video detail by slug',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('GetVideoResponseDto'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async getBySlug(@Param('slug') slug: string) {
    const result = await this.videosService.findBySlug(slug);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Post(':id/like')
  async likeVideo(@Param('id') id: string) {
    await this.videosService.handleLikeVideo(id);
    return formatApiResponse(null, HttpStatus.OK, 'ok');
  }

  @Post(':id/dislike')
  async dislikeVideo(@Param('id') id: string) {
    await this.videosService.handleDislikeVideo(id);
    return formatApiResponse(null, HttpStatus.OK, 'ok');
  }

  @Get('id/:id')
  @ApiResponse({
    status: 200,
    description: 'get video detail by id',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('Video'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Post('')
  @ApiResponse({
    status: 200,
    description: 'create video',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('Video'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() body: CreateVideoDto) {
    const result = await this.videosService.create(body);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'video created successfully!!',
    );
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update video',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('Video'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    const result = await this.videosService.update(id, updateVideoDto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'video updated successfully!!',
    );
  }

  //@Delete(':id')
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}
