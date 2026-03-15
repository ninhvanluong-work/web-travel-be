import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { VideoModule } from './modules/video/video.module';
import { TaskModule } from './modules/task/task.module';
import { ProductModule } from 'src/modules/product/product.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { OptionModule } from './modules/option/option.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    UserModule,
    ProductModule,
    DatabaseModule,
    VideoModule,
    TaskModule,
    EmbeddingModule,
    OptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
