import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetProductDetailDto {
  @ApiProperty({ example: '0df1ec7e-166e-4209-810a-23156b3b0489' })
  @IsUUID()
  id: string;
}
