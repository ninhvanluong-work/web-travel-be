import { ApiProperty } from '@nestjs/swagger';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetVideoDto extends PaginationDto {
  @ApiProperty({ description: 'query', nullable: true, example: 'Hà Nội' })
  query?: string;
}

export class VideoDto {
  @ApiProperty({
    description: 'ID',
    example: '37418d9b-cae4-42ab-ba36-65a0893e6d33',
  })
  id: string;

  @ApiProperty({ description: 'name', example: 'Hà Nội' })
  name: string;

  @ApiProperty({
    description: 'url',
    example: 'https://video.abc.com/video',
  })
  url: string;

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

export class GetVideoResponseDto extends ListItemsResponse<VideoDto> {
  @ApiProperty({ type: [VideoDto] })
  items: VideoDto[] = [];
}
