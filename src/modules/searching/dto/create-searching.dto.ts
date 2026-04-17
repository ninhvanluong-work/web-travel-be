import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSearchingDto {
  @ApiProperty({ example: 'Ha Long Bay' })
  @IsString()
  query: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  ipAddress: string;
}
