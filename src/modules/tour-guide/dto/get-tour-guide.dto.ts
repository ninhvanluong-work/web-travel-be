import { ApiProperty } from '@nestjs/swagger';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetTourGuidesDto extends PaginationDto {}

export class TourGuideDto {
  @ApiProperty({ example: '0df1ec7e-166e-4209-810a-23156b3b0489' })
  id: string;

  @ApiProperty({ example: 'Long' })
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar: string;

  @ApiProperty({ example: 120 })
  ratingCount: number;

  @ApiProperty({ example: 5 })
  expYear: number;

  @ApiProperty({ example: 4.5 })
  ratingStar: number;
}

export class GetTourGuidesResponseDto extends ListItemsResponse<TourGuideDto> {
  @ApiProperty({ type: [TourGuideDto] })
  declare items: TourGuideDto[];
}
