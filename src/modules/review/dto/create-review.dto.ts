import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RatingItemDto } from 'src/modules/tour-guide/dto/review-rating.dto';
import { tourGuideRatingsDefault } from 'src/modules/tour-guide/entities/tour-guide.entity';

export class CreateReviewDto {
  @ApiProperty({ example: 'Great experience with a very thoughtful guide' })
  @IsString()
  comment: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  point: number;

  @ApiProperty({ isArray: true, type: 'string', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ isArray: true, type: 'string', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  videos?: string[];

  @ApiProperty({
    type: [RatingItemDto],
    required: false,
    example: tourGuideRatingsDefault,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingItemDto)
  @IsOptional()
  tourGuideSubRatings?: RatingItemDto[];
}
