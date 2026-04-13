import { ApiProperty } from '@nestjs/swagger';

import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetProductReviewsDto extends PaginationDto {}

export class GetReviewResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date' })
  createdAt: Date;

  @ApiProperty({ format: 'date' })
  updatedAt: Date;

  @ApiProperty()
  comment: string;

  @ApiProperty({ type: 'number' })
  point: number;
}
export class GetReviewsResponseDto extends ListItemsResponse<GetReviewResponseDto> {
  @ApiProperty({ type: [GetReviewResponseDto] })
  declare items: GetReviewResponseDto[];
}
