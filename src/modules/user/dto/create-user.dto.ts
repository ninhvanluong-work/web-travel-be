import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from 'src/modules/user/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ format: 'email', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ type: 'string', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false, maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    enum: UserRole,
    required: false,
    default: UserRole.NORMAL,
    description:
      'admin chỉ được tạo normal/tour_guide; super_admin được tạo thêm admin; không thể tạo super_admin',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
