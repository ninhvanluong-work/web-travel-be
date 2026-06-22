import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { formatApiResponse } from 'src/common/utils/format';
import { LoginDto, LoginResponseDto } from 'src/modules/auth/dto/login.dto';

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
}
