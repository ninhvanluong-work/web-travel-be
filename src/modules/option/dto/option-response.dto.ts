import { ApiProperty } from '@nestjs/swagger';
import { OptionStatus } from '../entities/option.entity';
import { PickupLocationDto } from 'src/modules/pickup-location/dto/pickup-location-response.dto';
import { DepartureTimeDto } from 'src/modules/departure-time/dto/departure-time-response.dto';

export class OptionDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ example: 'option title' })
  title: string;

  @ApiProperty({ example: 'option description', nullable: true })
  description?: string | null;

  @ApiProperty({ example: 3, nullable: true })
  day: number;

  @ApiProperty({ example: 2, nullable: true })
  night: number;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ enum: OptionStatus })
  status: OptionStatus;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ isArray: true, type: 'string', nullable: true })
  allowUnit: string[];

  @ApiProperty({ example: 'VND' })
  currency: string;

  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  productId: string;

  @ApiProperty({ type: [PickupLocationDto] })
  pickupLocations: PickupLocationDto[];

  @ApiProperty({ type: [DepartureTimeDto] })
  departureTimes: DepartureTimeDto[];

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
