import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { VideoType } from 'src/modules/video/video.type';
export class CreateVideoDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  url?: string;

  @ApiProperty({ nullable: true })
  thumbnail?: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ nullable: true, enum: VideoType })
  @IsEnum(VideoType)
  type: VideoType;

  @ApiProperty({ nullable: true })
  tag?: string;

  @ApiProperty({ nullable: true })
  @IsUUID()
  productId?: string;
}
