import { ApiProperty } from '@nestjs/swagger';
import { SessionStatus } from '../entities/session.entity';
import { SessionUnitDto } from 'src/modules/session-unit/dto/session-unit-response.dto';

export class SessionDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  productId: string;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  travelDate: Date;

  @ApiProperty({ example: 20 })
  capacity: number;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty({ type: () => [SessionUnitDto] })
  sessionUnits: SessionUnitDto[];

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
