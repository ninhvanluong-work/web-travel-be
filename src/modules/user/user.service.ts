import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto, UserLoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { TourGuideService } from 'src/modules/tour-guide/tour-guide.service';
import { CreateTourGuideDto } from 'src/modules/tour-guide/dto/create-tour-guide.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tourGuideService: TourGuideService,
  ) {}

  async hashPassword(plainText: string) {
    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'),
      10,
    );

    const hash = await bcrypt.hash(plainText, saltRounds);
    return hash;
  }

  async comparePassword(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  async genLoginJwtToken(userId: string): Promise<string> {
    // Generate JWT token

    const jwtSecret = this.configService.get<string>('JWT_SECRET', '');
    const jwtPayload = {
      userId,
    };
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: jwtSecret,
    });

    return accessToken;
  }

  //TODO: check refresh token
  //async genRefreshToken(userId: string): Promise<string> {
  //  // Generate JWT token
  //  const jwtPayload = {
  //    userId,
  //  };
  //  const refreshToken = await this.jwtService.signAsync(
  //    { ...jwtPayload, jti: generateUUID() },
  //    {
  //      secret: generateUUID(),
  //      expiresIn: '7d',
  //    },
  //  );

  //  return refreshToken;
  //}

  async register(registerDto: RegisterDto) {
    const { email, password, role = UserRole.NORMAL } = registerDto;
    const existUser = await this.userRepository.findOneBy({ email });
    if (existUser) {
      throw new ConflictException(
        `email already register, please try to login!`,
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser: Partial<User> = {
      email,
      password: hashedPassword,
      role,
    };

    if (role === UserRole.TOUR_GUIDE) {
      //link user to tour-guide
      const newTourGuide: CreateTourGuideDto = {
        name: 'tour-guide',
      };
      const savedTourGuide = await this.tourGuideService.create(newTourGuide);
      newUser.tourGuideId = savedTourGuide.id;
    }

    const user = this.userRepository.create(newUser);
    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const loginErrMsg = `Email or password is incorrect`;

    const existUser = await this.userRepository.findOneBy({ email });

    if (!existUser) {
      throw new UnauthorizedException(loginErrMsg);
    }

    const isCorrectPassword = await this.comparePassword(
      password,
      existUser.password,
    );

    if (!isCorrectPassword) {
      throw new UnauthorizedException(loginErrMsg);
    }

    const user = plainToInstance(UserLoginDto, existUser, {
      excludeExtraneousValues: true,
    });

    const token = await this.genLoginJwtToken(user.id);
    return {
      token,
      refreshToken: token,
      user,
    };
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
