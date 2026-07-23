import { ApiProperty } from '@nestjs/swagger';

export class DepartureTimeDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  optionId: string;

  @ApiProperty({ example: '07:30:00' })
  time: string;

  @ApiProperty({ nullable: true, example: 'Khởi hành sáng' })
  label: string;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ nullable: true })
  note: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
