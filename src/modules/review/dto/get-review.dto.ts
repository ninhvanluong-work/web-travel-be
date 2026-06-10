import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Review } from 'src/modules/review/entities/review.entity';

import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetProductReviewsDto extends PaginationDto {}

export class GetTourGuideReviewsDto extends PaginationDto {}

export class GetReviewsDto extends PaginationDto {}

export class UserReviewDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;
}
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

  @ApiProperty({ isArray: true, type: 'string' })
  images?: string[];

  @ApiProperty({ isArray: true, type: 'string', required: false })
  videos?: string[];

  @ApiProperty({ type: Object, nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ type: UserReviewDto })
  user: UserReviewDto;
}

export class CreateReviewResponseDto extends OmitType(Review, [
  'product',
  'productId',
  'tourGuide',
  'user',
]) {}

export class GetReviewsResponseDto extends ListItemsResponse<GetReviewResponseDto> {
  @ApiProperty({ type: [GetReviewResponseDto] })
  declare items: GetReviewResponseDto[];
}
