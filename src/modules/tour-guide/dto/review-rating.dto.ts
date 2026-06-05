import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class RatingItemDto {
  @ApiProperty({ example: 'storytelling' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Storytelling' })
  @IsString()
  name: string;

  @ApiProperty({ example: 4.92 })
  @IsNumber()
  @Min(0)
  @Max(5)
  value: number;
}

export class ReviewRatingDto {
  @ApiProperty({
    type: [RatingItemDto],
    example: [
      { key: 'storytelling', name: 'Storytelling', value: 4.92 },
      { key: 'localKnowledge', name: 'Local knowledge', value: 4.95 },
      { key: 'careAttention', name: 'Care & attention', value: 4.85 },
      { key: 'safetyAwareness', name: 'Safety awareness', value: 4.9 },
      { key: 'punctuality', name: 'Punctuality', value: 4.82 },
      { key: 'english', name: 'English', value: 4.78 },
      { key: 'funny', name: 'Funny', value: 4.71 },
    ],
  })
  @IsOptional()
  ratings?: RatingItemDto[];
}
