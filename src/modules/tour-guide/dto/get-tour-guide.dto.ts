import { ApiProperty, OmitType } from '@nestjs/swagger';

import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
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
  ratingValue: number;

  @ApiProperty({})
  createdAt: Date;
}

export class GetTourGuidesResponseDto extends ListItemsResponse<TourGuideDto> {
  @ApiProperty({ type: [TourGuideDto] })
  declare items: TourGuideDto[];
}

export class DestinationSummaryDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  destinationId: string;

  @ApiProperty({ type: 'string' })
  destinationName: string;

  @ApiProperty({ type: 'number', example: 1 })
  productCount: number;
}

export class GetTourGuideDetailDto extends OmitType(TourGuide, ['products']) {
  @ApiProperty({ type: 'number', example: 1 })
  totalProducts: number;

  @ApiProperty({ type: [DestinationSummaryDto] })
  DestinationSummaryDto: DestinationSummaryDto;
}
