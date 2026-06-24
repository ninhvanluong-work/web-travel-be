import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/modules/user/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ format: 'email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @ApiProperty({ type: 'string', minLength: 6 })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @ApiProperty({ enum: UserRole, required: false, default: UserRole.NORMAL })
  role: UserRole;
}
