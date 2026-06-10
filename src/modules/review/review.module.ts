import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/modules/review/entities/review.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review, TourGuide, User])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
