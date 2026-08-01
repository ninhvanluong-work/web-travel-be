import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CapturePaymentDto {
  @ApiProperty({ example: '5O190127TN364715T' })
  @IsString()
  orderId: string;
}
