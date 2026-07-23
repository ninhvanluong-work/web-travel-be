import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartureTimeDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  optionId: string;

  @ApiProperty({ example: '07:30:00', description: 'giờ khởi hành' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'time must be in HH:mm or HH:mm:ss format',
  })
  time: string;

  @ApiPropertyOptional({ example: 'Khởi hành sáng' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
