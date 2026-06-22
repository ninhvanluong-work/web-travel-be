import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { formatApiResponse } from 'src/common/utils/format';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({
    status: 200,
    description: 'register user successfully',
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
}
