import { Module } from '@nestjs/common';

import { VideoModule } from 'src/modules/video/video.module';
import { SearchingModule } from 'src/modules/searching/searching.module';

import { TasksService } from 'src/modules/task/task.service';

@Module({
  imports: [VideoModule, SearchingModule],
  providers: [TasksService],
})
export class TaskModule {}
