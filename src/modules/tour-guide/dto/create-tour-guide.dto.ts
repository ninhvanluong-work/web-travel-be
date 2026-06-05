import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CareerPathItemDto {
  @ApiProperty({ example: 'VVV — Vietnam Village Vibes' })
  @IsString()
  company: string;

  @ApiProperty({ example: 'Lead guide' })
  @IsString()
  role: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  startYear: number;

  @ApiProperty({ example: 2025, required: false, nullable: true })
  @IsInt()
  @IsOptional()
  endYear?: number;

  @ApiProperty({ example: 184, required: false, nullable: true })
  @IsInt()
  @IsOptional()
  tourCount?: number;

  @ApiProperty({
    example: 'chuyên trekking và làng nghề',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

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

  @ApiProperty({ example: 5, required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  expYear?: number;

  @ApiProperty({
    example: 'My responsibility is serve everybody',
    required: false,
    nullable: true,
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  quote?: string;

  @ApiProperty({
    example: 'https://www.example.img/cover_img.png',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  coverImg?: string;

  @ApiProperty({
    example: 'I have 5+ years experience of tour guide',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({
    example: 'tour guide description',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['VI', 'EN', 'JP'],
    required: false,
    nullable: true,
    type: 'array',
    items: {
      type: 'string',
    },
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiProperty({
    example: ['Cultural tours', 'Trekking', 'Food tours'],
    required: false,
    nullable: true,
    type: 'array',
    items: {
      type: 'string',
    },
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  experts?: string[];

  @ApiProperty({
    type: [CareerPathItemDto],
    required: false,
    nullable: true,
    example: [
      {
        company: 'VVV — Vietnam Village Vibes',
        role: 'Lead guide',
        startYear: 2023,
        tourCount: 184,
        description: 'trekking and craft villages',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CareerPathItemDto)
  @IsOptional()
  careerPath?: CareerPathItemDto[];
}
