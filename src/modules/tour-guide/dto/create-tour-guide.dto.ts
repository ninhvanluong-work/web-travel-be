import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateTourGuideDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: 120, required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  ratingCount?: number;

  @ApiProperty({ example: 5, required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  expYear?: number;

  @ApiProperty({ example: 4.5, required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  ratingStar?: number;
}
