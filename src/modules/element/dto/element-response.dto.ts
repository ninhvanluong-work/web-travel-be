import { ApiProperty } from '@nestjs/swagger';
import { ELEMENT_KEY } from '../element.type';

export class ElementDto {
  @ApiProperty({
    type: 'string',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  id: string;

  @ApiProperty({ enum: ELEMENT_KEY })
  key: ELEMENT_KEY;

  @ApiProperty({ example: 'Element name' })
  name: string;

  @ApiProperty({ example: 'Optional description', nullable: true })
  description?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
