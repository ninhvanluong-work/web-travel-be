import { Controller, Post, Body, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { formatApiResponse } from 'src/common/utils/format';
import { LoginDto, LoginResponseDto } from 'src/modules/auth/dto/login.dto';
import { UserGuard } from 'src/common/guards';
import { UserId } from 'src/common/decorators';
import { USER_TOKEN } from 'src/common/constants';
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';

@Controller('auth')
@ApiExtraModels(LoginResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({
    status: 200,
    description: 'register user',
    schema: {
      properties: {
        data: { type: 'null', example: null },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return formatApiResponse(null, HttpStatus.OK, 'register user successfully');
  }

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'user login',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('LoginResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return formatApiResponse(result, HttpStatus.OK, 'user login successfully');
  }

  @Post('forgot-password')
  @ApiResponse({
    status: 200,
    description: 'forgot password',
    schema: {
      properties: {
        data: { type: 'null', example: null },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.handleForgotPassword(body);

    return formatApiResponse(
      null,
      HttpStatus.OK,
      'reset password mail already send to you',
    );
  }

  @Post('reset-password')
  @ApiResponse({
    status: 200,
    description: 'reset password',
    schema: {
      properties: {
        data: { type: 'null', example: null },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.handleResetPassword(body);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'reset password successfully!',
    );
  }
}
