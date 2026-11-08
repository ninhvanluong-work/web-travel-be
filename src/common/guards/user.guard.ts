import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { PUBLIC, TOUR_GUIDE, ADMIN, SUPER_ADMIN } from 'src/common/decorators';
import { UserRole } from 'src/modules/user/entities/user.entity';
import { BaseUserGuard } from './base-user.guard';

@Injectable()
export class UserGuard extends BaseUserGuard {
  protected readonly logger = new Logger(UserGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.getFlag(context, PUBLIC);
    const isTourGuide = this.getFlag(context, TOUR_GUIDE);
    const isAdmin = this.getFlag(context, ADMIN);
    const isSuperAdmin = this.getFlag(context, SUPER_ADMIN);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }
    try {
      const payload = await this.verifyToken(token);

      // Role decorators are combined with OR semantics:
      // e.g. @TourGuide() + @Admin() => tour guide OR admin token is accepted.
      if (isTourGuide || isAdmin || isSuperAdmin) {
        const role = payload?.role;
        const matchTourGuide = !!isTourGuide && !!payload?.tourGuideId;
        // super admin is also allowed for admin routes
        const matchAdmin =
          !!isAdmin &&
          (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN);
        const matchSuperAdmin = !!isSuperAdmin && role === UserRole.SUPER_ADMIN;

        if (!matchTourGuide && !matchAdmin && !matchSuperAdmin) {
          throw new UnauthorizedException('Invalid token');
        }
      }

      request['userId'] = payload.userId;
      request['tourGuideId'] = payload.tourGuideId;
      request['role'] = payload.role;
    } catch (error: any) {
      this.logger.log(error.message);
      throw new UnauthorizedException('Token expired or invalid');
    }

    return true;
  }
}
