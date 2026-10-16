import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { formatApiResponse } from 'src/common/utils/format';
import { IdDto } from 'src/types/common.dto';
import { Admin, CurrentRole, UserId } from 'src/common/decorators';
import { UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto, GetUsersResponseDto } from './dto/get-user.dto';
import { UserDto } from './dto/user-response.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

@Controller('user')
@ApiExtraModels(UserDto, GetUsersResponseDto)
@ApiBearerAuth(USER_TOKEN)
@Admin()
@UseGuards(UserGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create user',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('UserDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'created user successfully' },
      },
    },
  })
  async create(
    @Body() dto: CreateUserDto,
    @UserId() userId: string,
    @CurrentRole() role: UserRole,
  ) {
    const result = await this.userService.create(dto, { userId, role });
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created user successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'list users',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetUsersResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetUserDto) {
    const result = await this.userService.findAll(query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'user detail',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('UserDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const result = await this.userService.findOneDto(param.id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update user',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('UserDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'updated user successfully' },
      },
    },
  })
  async update(
    @Param() param: IdDto,
    @Body() dto: UpdateUserDto,
    @UserId() userId: string,
    @CurrentRole() role: UserRole,
  ) {
    const result = await this.userService.update(param.id, dto, {
      userId,
      role,
    });
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated user successfully',
    );
  }

  @Post(':id/reset-password')
  @ApiResponse({
    status: 200,
    description: 'reset user password (admin sets new password)',
    schema: {
      properties: {
        data: { type: 'object', example: {} },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'reset password successfully' },
      },
    },
  })
  async resetPassword(
    @Param() param: IdDto,
    @Body() dto: ResetUserPasswordDto,
    @UserId() userId: string,
    @CurrentRole() role: UserRole,
  ) {
    const result = await this.userService.resetPassword(param.id, dto, {
      userId,
      role,
    });
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'reset password successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'delete user (soft delete)',
    schema: {
      properties: {
        data: { type: 'object', example: {} },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'deleted user successfully' },
      },
    },
  })
  async remove(
    @Param() param: IdDto,
    @UserId() userId: string,
    @CurrentRole() role: UserRole,
  ) {
    const result = await this.userService.remove(param.id, { userId, role });
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'deleted user successfully',
    );
  }
}
