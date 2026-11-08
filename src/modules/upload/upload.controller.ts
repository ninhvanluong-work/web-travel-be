import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { formatApiResponse } from 'src/common/utils/format';
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
import { Admin, Public } from 'src/common/decorators';
import { standardResponseSchema } from 'src/common/utils/swagger';

@Controller('upload')
@ApiExtraModels(UploadVideoResponseDto, UploadFileResponseDto)
//@ApiBearerAuth(USER_TOKEN)
//@Admin()
//@UseGuards(UserGuard)
//TODO: check client
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('video')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // 5 req / 1 min / IP
  @ApiResponse({
    status: 200,
    description: 'create singed video upload',
    schema: standardResponseSchema({
      $ref: getSchemaPath('UploadVideoResponseDto'),
    }),
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
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // 5 req / 1 min / IP
  @ApiBody({
    type: UploadFileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'upload by filetype',
    schema: standardResponseSchema({
      $ref: getSchemaPath('UploadFileResponseDto'),
    }),
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
