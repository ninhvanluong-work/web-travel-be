import { ApiProperty } from '@nestjs/swagger';

export class DestinationDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ example: 'Hạ Long' })
  name: string;

  @ApiProperty({
    example: 'Vịnh Hạ Long - di sản thiên nhiên thế giới',
    nullable: true,
  })
  description: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
