import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty({ example: 'Hạ Long', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Vịnh Hạ Long - di sản thiên nhiên thế giới',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
