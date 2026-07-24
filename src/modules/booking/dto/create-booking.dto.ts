import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingPassengerInputDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  unitId: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  count: number;
}

export class CreateBookingDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  optionId: string;

  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  tourSessionId: string;

  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  pickupLocationId?: string;

  @ApiPropertyOptional({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsOptional()
  @IsUUID()
  departureId?: string;

  @ApiProperty({ type: [BookingPassengerInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingPassengerInputDto)
  passengers: BookingPassengerInputDto[];

  @ApiPropertyOptional({ example: 'guest@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}
