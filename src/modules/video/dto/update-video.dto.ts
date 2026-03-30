import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoDto } from './create-video.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @ApiProperty({ nullable: true })
  embedding?: string;
}
