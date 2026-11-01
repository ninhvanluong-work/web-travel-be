import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { OPTIONAL_AUTH } from 'src/common/decorators';
import { UserGuard } from './user.guard';
import { OptionalUserGuard } from './optional-user.guard';

/**
 * Global guard: every route requires login by default.
 * - @Public()       -> no auth check (handled inside UserGuard)
 * - @OptionalAuth() -> delegates to OptionalUserGuard
 * - otherwise       -> delegates to UserGuard (+ @Admin/@TourGuide/@SuperAdmin)
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userGuard: UserGuard,
    private readonly optionalUserGuard: OptionalUserGuard,
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      OPTIONAL_AUTH,
      [context.getHandler(), context.getClass()],
    );

    if (isOptionalAuth) {
      return this.optionalUserGuard.canActivate(context);
    }

    return this.userGuard.canActivate(context);
  }
}
