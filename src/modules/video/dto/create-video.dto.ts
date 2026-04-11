import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { VideoType } from 'src/modules/video/video.type';
export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ format: 'uuid', type: 'string' })
  @IsNotEmpty()
  @IsString()
  guid: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ nullable: true, enum: VideoType })
  @IsEnum(VideoType)
  @IsOptional()
  type?: VideoType;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  @IsUUID()
  @IsOptional()
  productId?: string;
}
