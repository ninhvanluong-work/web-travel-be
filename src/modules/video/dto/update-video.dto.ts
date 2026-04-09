import { CreateVideoDto } from './create-video.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @ApiProperty({ nullable: true })
  embedding?: string;
}
