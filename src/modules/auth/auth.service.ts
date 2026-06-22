import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(registerDto: RegisterDto) {
    return await this.userService.register(registerDto);
  }

  async login(loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }
}
