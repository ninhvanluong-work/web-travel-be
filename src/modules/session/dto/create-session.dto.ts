import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SessionStatus } from '../entities/session.entity';
import { SessionUnitInputDto } from 'src/modules/session-unit/dto/session-unit-input.dto';

export class CreateSessionDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  travelDate: string;

  //@ApiPropertyOptional({
  //  example: 20,
  //  description: 'số khả dụng cho phép book',
  //})
  //@IsOptional()
  //@Type(() => Number)
  //@IsInt()
  //@Min(0)
  //capacity?: number;

  @ApiPropertyOptional({
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({
    type: [SessionUnitInputDto],
    description: 'danh sách unit và giá áp dụng cho session này',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionUnitInputDto)
  sessionUnits?: SessionUnitInputDto[];
}
