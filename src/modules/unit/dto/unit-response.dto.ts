import { ApiProperty } from '@nestjs/swagger';

export class UnitDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  productId: string;

  @ApiProperty({ example: 'Adult' })
  name: string;

  @ApiProperty({ nullable: true })
  note: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
