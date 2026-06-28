import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Review } from 'src/modules/review/entities/review.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';

import { UserModule } from 'src/modules/user/user.module';

import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review, TourGuide]), UserModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
