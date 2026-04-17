import { Module } from '@nestjs/common';
import { SearchingService } from './searching.service';
import { SearchingController } from './searching.controller';

@Module({
  controllers: [SearchingController],
  providers: [SearchingService],
})
export class SearchingModule {}
