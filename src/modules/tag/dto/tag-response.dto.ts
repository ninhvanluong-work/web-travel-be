import { ApiProperty } from '@nestjs/swagger';

export class TagDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ example: 'adventure' })
  name: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
