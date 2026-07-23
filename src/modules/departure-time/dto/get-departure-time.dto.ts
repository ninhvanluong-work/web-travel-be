import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetDepartureTimeDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  optionId: string;
}
