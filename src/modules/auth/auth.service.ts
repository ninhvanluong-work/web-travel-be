import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';

import { RegisterDto } from './dto/register.dto';
import { LoginDto, UserLoginDto } from 'src/modules/auth/dto/login.dto';
import { User, UserRole } from 'src/modules/user/entities/user.entity';

import { CreateTourGuideDto } from 'src/modules/tour-guide/dto/create-tour-guide.dto';
import { TourGuideService } from 'src/modules/tour-guide/tour-guide.service';
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';
import { RenewTokenDto } from 'src/modules/auth/dto/renew-token.dto';

//TODO: refactor: authDto, jwtPayloadDto
@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tourGuideService: TourGuideService,
    private readonly mailerService: MailerService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async genLoginJwtToken(payload: {
    userId: string;
    tourGuideId: string;
    version?: number;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, tourGuideId, version = 1 } = payload;
    const jwtSecret = this.configService.get<string>('JWT_SECRET', '');
    const jwtPayload = {
      userId,
      tourGuideId,
    };

    const refreshTokenPayload = {
      userId,
      tourGuideId,
      version,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: jwtSecret,
    });

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: jwtSecret,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

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

    const { accessToken, refreshToken } = await this.genLoginJwtToken({
      userId: existUser.id,
      tourGuideId: existUser.tourGuideId,
      version: existUser.refreshTokenVersion,
    });

    const user = plainToInstance(UserLoginDto, existUser, {
      excludeExtraneousValues: true,
    });

    return {
      token: accessToken,
      refreshToken,
      user,
    };
  }

  async handleForgotPassword(payload: ForgotPasswordDto) {
    const { email } = payload;
    const prefixLog = `[handleForgotPassword] ${email}`;
    this.logger.log(`${prefixLog} running `);

    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`${prefixLog} check existed reset password `);

    if (user.resetPasswordTokenExp && user.resetPasswordTokenExp > new Date()) {
      throw new ConflictException('Please check reset password in your email');
    }

    this.logger.log(`${prefixLog} create password token `);

    const rawToken = randomBytes(32).toString('hex'); // 64 chars hex
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    this.logger.log(`${prefixLog} update user resetPassword`);
    await this.userRepository.update(
      {
        email,
      },
      {
        resetPasswordToken: tokenHash,
        resetPasswordTokenExp: expiresAt,
      },
    );

    const resetUrl = `${this.configService.getOrThrow('FRONTEND_URL')}/reset-password?token=${rawToken}`;

    this.logger.log(`${prefixLog} send mail to user`);
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 5 minutes.</p>`,
    });
  }

  async handleResetPassword(payload: ResetPasswordDto) {
    const { token, newPassword } = payload;
    const prefixLog = `[handleResetPassword] token: ${token}`;

    const tokenHash = createHash('sha256').update(token).digest('hex');

    this.logger.log(`${prefixLog} find user by passwordToken`);
    const user = await this.userRepository.findOneBy({
      resetPasswordToken: tokenHash,
    });

    if (
      !user ||
      !user.resetPasswordTokenExp ||
      user.resetPasswordTokenExp.getTime() < new Date().getTime()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    this.logger.log(`${prefixLog} update user new password`);

    await this.userRepository.update(
      { id: user.id },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExp: null,
      },
    );
  }

  async handleRenewAccessToken(payload: RenewTokenDto) {
    const prefixLog = `[handleRenewAccessToken]`;

    const { refreshToken } = payload;
    let decoded: { userId: string; tourGuideId: string; version: number };

    const errorMsg = `Token expired or invalid`;
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      decoded = await this.jwtService.verifyAsync(refreshToken, { secret });
    } catch (error: any) {
      this.logger.warn(
        `${prefixLog} Verify refresh token failed: ${error.message}`,
      );
      throw new UnauthorizedException(errorMsg);
    }

    const { userId, version, tourGuideId } = decoded;
    this.logger.log(
      `${prefixLog} Decoded token - userId=${userId}, tourGuideId=${tourGuideId}, version=${version}`,
    );

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      this.logger.warn(`${prefixLog} User not found - userId=${userId}`);
      throw new UnauthorizedException(errorMsg);
    }

    if (!version || user.refreshTokenVersion !== version) {
      this.logger.warn(
        `${prefixLog} Token version mismatch (possible token reuse) - userId=${userId}, tokenVersion=${version}, dbVersion=${user.refreshTokenVersion}`,
      );
      throw new UnauthorizedException(errorMsg);
    }

    await this.userRepository.increment(
      { id: userId },
      'refreshTokenVersion',
      1,
    );

    const newVersion = version + 1;
    this.logger.log(
      `${prefixLog} Refresh token version incremented - userId=${userId}, newVersion=${newVersion}`,
    );

    const { accessToken, refreshToken: newRefreshToken } =
      await this.genLoginJwtToken({
        userId,
        tourGuideId,
        version: newVersion,
      });

    const userDto = plainToInstance(UserLoginDto, user, {
      excludeExtraneousValues: true,
    });

    this.logger.log(
      `${prefixLog} Renew access token success - userId=${userId}`,
    );

    return {
      token: accessToken,
      refreshToken: newRefreshToken,
      user: userDto,
    };
  }
}
