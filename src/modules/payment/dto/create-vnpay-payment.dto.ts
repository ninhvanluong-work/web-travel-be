import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateVnpayPaymentDto {
  @ApiProperty({ required: false, example: 'NCB' })
  @IsOptional()
  @IsString()
  bankCode?: string;
}
