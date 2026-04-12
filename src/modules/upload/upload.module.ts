import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from 'src/modules/upload/upload.controller';

@Module({
  providers: [UploadService],
  imports: [ConfigModule],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
