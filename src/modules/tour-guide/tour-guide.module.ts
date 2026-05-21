import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TourGuideController } from './tour-guide.controller';
import { TourGuideService } from './tour-guide.service';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TourGuide])],
  controllers: [TourGuideController],
  providers: [TourGuideService],
})
export class TourGuideModule {}
