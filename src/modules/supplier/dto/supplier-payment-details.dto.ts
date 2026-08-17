import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SupplierPaymentDetailsDto {
  @ApiProperty({ required: false, description: 'bank method' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ required: false, description: 'bank method' })
  @IsOptional()
  @IsString()
  accountHolder?: string;

  @ApiProperty({ required: false, description: 'bank method' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ required: false, description: 'bank method' })
  @IsOptional()
  @IsString()
  swiftCode?: string;

  @ApiProperty({ required: false, description: 'card method' })
  @IsOptional()
  @IsString()
  cardHolder?: string;

  @ApiProperty({ required: false, description: 'card method' })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiProperty({ required: false, description: 'card method' })
  @IsOptional()
  @IsString()
  expiryMonth?: string;

  @ApiProperty({ required: false, description: 'card method' })
  @IsOptional()
  @IsString()
  expiryYear?: string;

  @ApiProperty({ required: false, description: 'paypal method' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
