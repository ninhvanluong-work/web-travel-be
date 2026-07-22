import { ApiProperty } from '@nestjs/swagger';
import { TourSessionStatus } from '../entities/tour-session.entity';

export class TourSessionDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  optionId: string;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  travelDate: Date;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  departureTime: Date;

  @ApiProperty({ example: 20 })
  capacity: number;

  @ApiProperty({ example: 20 })
  remainingSlot: number;

  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  unitRefId: string;

  @ApiProperty({ example: 1500000 })
  price: number;

  @ApiProperty({ enum: TourSessionStatus })
  status: TourSessionStatus;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
