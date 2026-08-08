import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionUnitInputDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  unitId: string;

  @ApiProperty({
    example: 1500000,
    description: 'giá của unit trong session này',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}
