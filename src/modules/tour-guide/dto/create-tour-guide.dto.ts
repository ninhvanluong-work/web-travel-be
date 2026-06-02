import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

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
}
