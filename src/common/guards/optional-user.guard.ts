import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { PUBLIC, TOUR_GUIDE } from 'src/common/decorators';
import { BaseUserGuard } from './base-user.guard';

@Injectable()
export class OptionalUserGuard extends BaseUserGuard {
  protected readonly logger = new Logger(OptionalUserGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.getFlag(context, PUBLIC);
    const isTourGuide = this.getFlag(context, TOUR_GUIDE);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    // không có token -> vẫn cho qua (khách vãng lai)
    if (!token) {
      return true;
    }

    try {
      const payload = await this.verifyToken(token);

      if (isTourGuide && !payload?.tourGuideId) {
        throw new UnauthorizedException('Invalid token');
      }

      request['userId'] = payload.userId;
      request['tourGuideId'] = payload.tourGuideId;
    } catch (error: any) {
      this.logger.log(error.message);
      throw new UnauthorizedException('Token expired or invalid');
    }

    return true;
  }
}
