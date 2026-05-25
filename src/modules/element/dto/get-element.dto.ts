import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetElementDto {
  @ApiPropertyOptional({
    example: 'day',
    description: 'search by name or key',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: string;
}
