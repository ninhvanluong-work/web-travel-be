import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
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
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';
import { RenewTokenDto } from 'src/modules/auth/dto/renew-token.dto';
import { ChangePasswordDto } from 'src/modules/auth/dto/change-password.dto';
import { Public, UserId } from 'src/common/decorators';
import { USER_TOKEN } from 'src/common/constants';
import { standardResponseSchema } from 'src/common/utils/swagger';

@Controller('auth')
@ApiExtraModels(LoginResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'register user',
    schema: standardResponseSchema({ type: 'null', example: null }),
  })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return formatApiResponse(null, HttpStatus.OK, 'register user successfully');
  }

  @Post('login')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'user login',
    schema: standardResponseSchema({ $ref: getSchemaPath('LoginResponseDto') }),
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return formatApiResponse(result, HttpStatus.OK, 'user login successfully');
  }

  @Post('admin/login')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'admin login',
    schema: standardResponseSchema({ $ref: getSchemaPath('LoginResponseDto') }),
  })
  async loginAdmin(@Body() loginDto: LoginDto) {
    const result = await this.authService.loginAdmin(loginDto);
    return formatApiResponse(result, HttpStatus.OK, 'admin login successfully');
  }

  @Post('forgot-password')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'forgot password',
    schema: standardResponseSchema({ type: 'null', example: null }),
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
  @Public()
  @ApiResponse({
    status: 200,
    description: 'reset password',
    schema: standardResponseSchema({ type: 'null', example: null }),
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.handleResetPassword(body);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'reset password successfully!',
    );
  }

  @Post('access-token/renew')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'get new access token',
    schema: standardResponseSchema({ $ref: getSchemaPath('LoginResponseDto') }),
  })
  async renewAccessToken(@Body() body: RenewTokenDto) {
    const result = await this.authService.handleRenewAccessToken(body);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'renew token successfully!',
    );
  }

  @Post('change-password')
  @ApiBearerAuth(USER_TOKEN)
  @ApiResponse({
    status: 200,
    description:
      'change password of current user, returns new tokens (other devices are logged out)',
    schema: standardResponseSchema({ $ref: getSchemaPath('LoginResponseDto') }),
  })
  async changePassword(
    @UserId() userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(userId, body);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'change password successfully',
    );
  }

  @Post('logout')
  @ApiBearerAuth(USER_TOKEN)
  @ApiResponse({
    status: 200,
    description: 'logout',
    schema: standardResponseSchema({ type: 'null', example: null }),
  })
  async logout(@UserId() userId: string) {
    await this.authService.logout(userId);
    return formatApiResponse(null, HttpStatus.OK, 'logout successfully');
  }
}
