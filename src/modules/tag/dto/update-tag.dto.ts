import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'family-friendly' })
  @IsOptional()
  @IsString()
  name?: string;
}
