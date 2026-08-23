import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'supplierA' })
  @IsString()
  name: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({
    nullable: true,
    example: 'supplier@example.com',
    description: 'Email to notify on new bookings',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  //@ApiProperty({ default: 0 })
  //@IsOptional()
  //@IsNumber()
  //@Min(0)
  //ratingCount?: number = 0;

  //@ApiProperty({ default: 0 })
  //@IsOptional()
  //@IsNumber()
  //@Min(0)
  //@Max(5)
  //ratingRate?: number = 0;

  //@ApiProperty({ default: false })
  //@IsOptional()
  //@IsBoolean()
  //isVerified?: boolean = false;

  //@ApiProperty({ default: 0 })
  //@IsOptional()
  //@IsNumber()
  //@Min(0)
  //tourOffered?: number = 0;

  //@ApiProperty({ default: 0 })
  //@IsOptional()
  //@IsNumber()
  //@Min(0)
  //@Max(100)
  //responseRate?: number = 0;
}
