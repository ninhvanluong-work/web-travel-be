import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  async hashText(plainText: string) {
    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'),
      10,
    );

    const hash = await bcrypt.hash(plainText, saltRounds);
    return hash;
  }

  async register(registerDto: RegisterDto) {
    const { password } = registerDto;
    const hashedPassword = await this.hashText(password);

    return await this.userService.register(registerDto.email, hashedPassword);
  }
}
