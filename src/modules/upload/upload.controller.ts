import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import {
  UploadVideoDto,
  UploadVideoResponseDto,
} from 'src/modules/upload/dto/upload-video.dto';
import { UploadService } from 'src/modules/upload/upload.service';

@Controller('upload')
@ApiExtraModels(UploadVideoResponseDto)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('video')
  @ApiResponse({
    status: 200,
    description: 'create singed video upload',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('UploadVideoResponseDto'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async uploadVideo(@Body() body: UploadVideoDto) {
    const result = await this.uploadService.handleUploadVideo(body);

    return formatApiResponse(
      result,
      HttpStatus.OK,
      'signed video successfully',
    );
  }
}
