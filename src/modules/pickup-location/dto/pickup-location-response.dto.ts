import { ApiProperty } from '@nestjs/swagger';

export class PickupLocationDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  optionId: string;

  @ApiProperty({ example: 'pickup location name' })
  name: string;

  @ApiProperty({ nullable: true })
  address: string;

  @ApiProperty({ default: false })
  isPopular: boolean;

  @ApiProperty({ nullable: true })
  mapUrl: string;

  @ApiProperty({ default: 0 })
  order: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
