import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TourSession } from './entities/tour-session.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { UnitReference } from 'src/modules/unit-reference/entities/unit-reference.entity';
import { TourSessionService } from './tour-session.service';
import { TourSessionController } from './tour-session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TourSession, Option, UnitReference])],
  providers: [TourSessionService],
  controllers: [TourSessionController],
  exports: [TourSessionService],
})
export class TourSessionModule {}
