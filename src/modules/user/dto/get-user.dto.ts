import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { UserRole } from 'src/modules/user/entities/user.entity';
import { UserDto } from 'src/modules/user/dto/user-response.dto';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetUserDto extends PaginationDto {
  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class GetUsersResponseDto extends ListItemsResponse<UserDto> {
  @ApiProperty({ type: [UserDto] })
  declare items: UserDto[];
}
