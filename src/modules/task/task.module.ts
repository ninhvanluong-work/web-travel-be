import { Module } from '@nestjs/common';

import { VideoModule } from 'src/modules/video/video.module';

import { TasksService } from 'src/modules/task/task.service';

@Module({
  imports: [VideoModule],
  providers: [TasksService],
})
export class TaskModule {}
