import { Controller, Post, Body, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { formatApiResponse } from 'src/common/utils/format';
import { LoginDto, LoginResponseDto } from 'src/modules/auth/dto/login.dto';
import { UserGuard } from 'src/common/guards';
import { UserId } from 'src/common/decorators';
import { USER_TOKEN } from 'src/common/constants';

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
  @ApiBearerAuth(USER_TOKEN)
  @UseGuards(UserGuard)
  async forgotPassword(@UserId() userId: string) {
    await this.authService.handleForgotPassword(userId);

    return formatApiResponse(
      null,
      HttpStatus.OK,
      'forget password on processing',
    );
  }
}
