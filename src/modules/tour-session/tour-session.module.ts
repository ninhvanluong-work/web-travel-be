import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TourSession } from './entities/tour-session.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { TourSessionService } from './tour-session.service';
import { TourSessionController } from './tour-session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TourSession, Option])],
  providers: [TourSessionService],
  controllers: [TourSessionController],
  exports: [TourSessionService],
})
export class TourSessionModule {}
