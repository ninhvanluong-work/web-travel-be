import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GetVideoDto {
  @ApiProperty({
    description: 'query',
    nullable: true,
    example: 'Miền Bắc',
    required: false,
  })
  query?: string;

  @ApiProperty({
    description: 'query',
    required: false,
    nullable: true,
    example: '0',
  })
  @Min(0)
  @IsNumber()
  @IsOptional()
  distanceScore?: number;

  @ApiProperty({
    required: false,
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  pageSize?: number;

  @ApiProperty({
    description: 'rootId',
    nullable: true,
    required: false,
    example: '37418d9b-cae4-42ab-ba36-65a0893e6d33',
  })
  @IsUUID()
  @IsOptional()
  rootId?: string;

  @ApiProperty({
    description: 'excludeIds',
    nullable: true,
    required: false,
    example: ['37418d9b-cae4-42ab-ba36-65a0893e6d33'],
  })
  @IsOptional()
  @Transform((data) => {
    const value = data.value as string;
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(',').filter(Boolean);
  })
  @IsArray()
  @IsUUID('all', { each: true })
  excludeIds?: string[];
}

export class VideoDto {
  @ApiProperty({
    description: 'ID',
    example: '37418d9b-cae4-42ab-ba36-65a0893e6d33',
  })
  id: string;

  @ApiProperty({ description: 'name', example: 'Miền Bắc' })
  name: string;

  @ApiProperty({
    description: 'url',
    example: 'https://video.abc.com/video',
  })
  url: string;

  @ApiProperty({
    description: 'shortUrl',
    example: 'https://video.abc.com/video',
  })
  shortUrl: string;

  @ApiProperty({
    description: 'embedUrl',
    example: 'https://video.abc.com/video',
  })
  embedUrl: string;

  @ApiProperty({
    description: 'query',
    example: 'https://video.abc.com/video/123/thumbnail',
  })
  thumbnail: string;

  @ApiProperty({ description: 'video description' })
  description: string;

  @ApiProperty({ description: 'video tag', nullable: true })
  tag?: string;

  @ApiProperty({ description: 'video like', example: 100 })
  like: string;
}

export class GetVideoResponseStatsDto {
  @ApiProperty({ type: 'number', example: '0' })
  distanceScore: number;
}

export class GetVideoResponseDto {
  @ApiProperty({ type: [VideoDto] })
  items: VideoDto[] = [];

  @ApiProperty({})
  stats: GetVideoResponseStatsDto;
}
