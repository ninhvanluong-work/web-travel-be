import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

import { ELEMENT_KEY } from '../element.type';

export class CreateElementDto {
  @ApiProperty({ enum: ELEMENT_KEY })
  @IsEnum(ELEMENT_KEY)
  key: ELEMENT_KEY;

  @ApiProperty({ example: 'Element name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;
}
