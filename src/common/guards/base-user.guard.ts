import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

/**
 * Phần dùng chung của UserGuard / OptionalUserGuard:
 * đọc metadata decorator, tách bearer token, verify JWT.
 * Quyết định thiếu token / sai role xử lý thế nào nằm ở từng guard con.
 */
@Injectable()
export abstract class BaseUserGuard implements CanActivate {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly reflector: Reflector,
    protected readonly configService: ConfigService,
  ) {}

  abstract canActivate(context: ExecutionContext): Promise<boolean>;

  // metadata của decorator (vd @Public, @Admin), ưu tiên handler rồi tới class
  protected getFlag(context: ExecutionContext, key: string): boolean {
    return this.reflector.getAllAndOverride<boolean>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  // header "Authorization: Bearer <token>"
  protected extractToken(request: any): string {
    return request.headers.authorization?.split(' ')[1];
  }

  protected verifyToken(token: string): Promise<any> {
    const secret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.verifyAsync(token, {
      secret,
    });
  }
}
