import { IsOptional, IsString } from 'class-validator';
import { CreateVideoDto } from './create-video.dto';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @ApiProperty({ nullable: true })
  embedding?: string;
}

export class UpdateMomentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
