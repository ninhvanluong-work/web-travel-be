import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
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
  url?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  thumbnail?: string;
  
  @ApiPropertyOptional({ nullable: true })
  @IsString()
  description?: string;
  
  @ApiPropertyOptional({ nullable: true, enum: VideoType })
  @IsEnum(VideoType)
  type?: VideoType;

  @ApiPropertyOptional({ nullable: true })
  @IsUUID()
  productId: string;
}
