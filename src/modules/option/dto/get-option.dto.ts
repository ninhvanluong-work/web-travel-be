import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';

import { OptionStatus } from '../entities/option.entity';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';
import { OptionDto } from './option-response.dto';

export class GetOptionDto extends PaginationDto {
  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ enum: OptionStatus })
  @IsOptional()
  @IsEnum(OptionStatus)
  status?: OptionStatus;
}

export class GetOptionsResponseDto extends ListItemsResponse<OptionDto> {
  @ApiProperty({ type: [OptionDto] })
  declare items: OptionDto[];
}
