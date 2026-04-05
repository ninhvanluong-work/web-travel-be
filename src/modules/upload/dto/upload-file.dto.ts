import { ApiProperty } from '@nestjs/swagger';
import { FileType } from 'src/modules/upload/upload.type';

export class UploadFileDto {
  @ApiProperty({ required: true, format: 'binary', type: 'string' })
  file: string;
}

export class UploadFileParam {
  @ApiProperty({ enum: FileType, required: true })
  fileType: FileType;
}

export class UploadFileResponseDto {
  @ApiProperty({ required: true, enum: FileType })
  fileType: FileType;

  @ApiProperty({
    format: 'uri',
    example:
      'https://vnzone.b-cdn.net/img/vn-11134231-820l4-miiuzok44ume9c.jpeg',
  })
  url: string;
}
