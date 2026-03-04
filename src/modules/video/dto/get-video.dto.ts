import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetVideoDto {
  @ApiProperty({ description: 'query', nullable: true, example: 'Miền Bắc' })
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
