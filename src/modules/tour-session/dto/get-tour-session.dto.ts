import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';

import { TourSessionStatus } from '../entities/tour-session.entity';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';
import { TourSessionDto } from './tour-session-response.dto';

export class GetTourSessionDto extends PaginationDto {
  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  optionId?: string;

  @ApiPropertyOptional({ enum: TourSessionStatus })
  @IsOptional()
  @IsEnum(TourSessionStatus)
  status?: TourSessionStatus;

  @ApiPropertyOptional({
    description: 'Từ ngày (ISO 8601)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày (ISO 8601)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class GetTourSessionsResponseDto extends ListItemsResponse<TourSessionDto> {
  @ApiProperty({ type: [TourSessionDto] })
  declare items: TourSessionDto[];
}
