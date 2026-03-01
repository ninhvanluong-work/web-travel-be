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

@Controller('video')
@ApiExtraModels(GetVideoDto, GetVideoResponseDto)
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

  //@Post()
  create(@Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create(createVideoDto);
  }

  //@Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  //@Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(id, updateVideoDto);
  }

  //@Delete(':id')
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}
