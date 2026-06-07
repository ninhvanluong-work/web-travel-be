import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TourGuideController } from './tour-guide.controller';
import { TourGuideService } from './tour-guide.service';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { ProductTourGuide } from 'src/modules/product/entities/product-tour-guide.entity';
import { ReviewModule } from 'src/modules/review/review.module';
import { VideoModule } from 'src/modules/video/video.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TourGuide, ProductTourGuide]),
    ReviewModule,
    VideoModule,
  ],
  controllers: [TourGuideController],
  providers: [TourGuideService],
})
export class TourGuideModule {}
