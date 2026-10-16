import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { UserRole } from 'src/modules/user/entities/user.entity';

export class UserDto {
  @ApiProperty({ example: '0df1ec7e-166e-4209-810a-23156b3b0489' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn A', nullable: true })
  @Expose()
  name: string;

  @ApiProperty({ format: 'email', nullable: true })
  @Expose()
  email: string;

  @ApiProperty({ enum: UserRole })
  @Expose()
  role: UserRole;

  @ApiProperty({ format: 'uuid', nullable: true })
  @Expose()
  tourGuideId: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  updatedAt: Date;
}
