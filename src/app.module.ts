import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [UserModule,ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env'
  }), DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
