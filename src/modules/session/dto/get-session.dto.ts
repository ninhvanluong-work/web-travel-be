import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';

import { SessionStatus } from '../entities/session.entity';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';
import { SessionDto } from './session-response.dto';

export class GetSessionDto extends PaginationDto {
  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

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

export class GetSessionsResponseDto extends ListItemsResponse<SessionDto> {
  @ApiProperty({ type: [SessionDto] })
  declare items: SessionDto[];
}
