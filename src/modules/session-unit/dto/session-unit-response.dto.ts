import { ApiProperty } from '@nestjs/swagger';

export class SessionUnitDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  sessionId: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  unitId: string;

  @ApiProperty({ example: 1500000, description: 'giá của unit trong session này' })
  price: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
