import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { PUBLIC, TOUR_GUIDE } from 'src/common/decorators';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isTourGuide = this.reflector.getAllAndOverride<boolean>(TOUR_GUIDE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token: string = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      //check is tour guide token
      if (isTourGuide && !payload?.tourGuideId) {
        throw new UnauthorizedException('Invalid token');
      }

      request['userId'] = payload.userId;
      request['tourGuideId'] = payload.tourGuideId;
    } catch (error: any) {
      console.log(error.message);
      throw new UnauthorizedException('Token expired or invalid');
    }

    return true;
  }
}
