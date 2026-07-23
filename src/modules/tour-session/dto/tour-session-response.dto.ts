import { ApiProperty } from '@nestjs/swagger';
import { TourSessionStatus } from '../entities/tour-session.entity';
import { UnitReferenceDto } from 'src/modules/unit-reference/dto/unit-reference-response.dto';

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

  @ApiProperty({ example: 20 })
  remainingSlot: number;

  @ApiProperty({ type: [UnitReferenceDto] })
  unitReferences: UnitReferenceDto[];

  @ApiProperty({ enum: TourSessionStatus })
  status: TourSessionStatus;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
