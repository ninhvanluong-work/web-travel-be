import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadVideoDto {
  @ApiProperty({ example: 'video title', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UploadVideoResponseDto {
  @ApiProperty({ format: 'uuid', required: true })
  videoId: string;

  @ApiProperty({ example: '123456', required: true })
  libraryId: string;

  @ApiProperty({ type: 'number', example: '12345678', required: true })
  expirationTime: number;

  @ApiProperty({ example: 'salksjgladjk', required: true })
  signature: string;
}
