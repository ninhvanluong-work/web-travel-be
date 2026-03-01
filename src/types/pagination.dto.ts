import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ required: false, example: 1, default: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

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

export class PaginationResponse {
  @ApiProperty({ type: 'number', example: 1 })
  page: number;

  @ApiProperty({ type: 'number', example: 10 })
  pageSize: number;

  @ApiProperty({ type: 'number', example: 22 })
  total: number;

  @ApiProperty({ type: 'number', example: 3 })
  totalPages: number;
}

export class ListItemsResponse<T, G = undefined> {
  @ApiProperty({})
  items: T[];

  @ApiProperty({})
  pagination: PaginationResponse;

  @ApiProperty({})
  stats?: G;
}
