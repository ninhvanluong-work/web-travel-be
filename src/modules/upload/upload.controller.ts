import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiResponse,
} from '@nestjs/swagger';

import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import {
  UploadFileDto,
  UploadFileParam,
  UploadFileResponseDto,
} from 'src/modules/upload/dto/upload-file.dto';
import {
  UploadVideoDto,
  UploadVideoResponseDto,
} from 'src/modules/upload/dto/upload-video.dto';

import { UploadService } from 'src/modules/upload/upload.service';

@Controller('upload')
@ApiExtraModels(UploadVideoResponseDto, UploadFileResponseDto)
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

  @Post(':fileType')
  @ApiBody({
    type: UploadFileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'upload by filetype',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('UploadFileResponseDto'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param() param: UploadFileParam,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.uploadService.handleUploadFile(
      file,
      param.fileType,
    );

    return formatApiResponse(result, HttpStatus.OK, 'upload successfully');
  }
}
