import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

import { UploadService } from 'src/modules/upload/upload.service';
import { FileType } from 'src/modules/upload/upload.type';

const execAsync = promisify(exec);

@Injectable()
export class VideoEditorService {
  logger = new Logger(VideoEditorService.name);

  constructor(private readonly uploadService: UploadService) {}

  async cutVideoPreview(videoUrl: string): Promise<string> {
    const previewName = `preview-${Date.now()}.mp4`;
    const outputPath = path.join(process.cwd(), 'tmp', previewName);

    try {
      // 1. đảm bảo thư mục tmp tồn tại
      if (!fs.existsSync('tmp')) {
        fs.mkdirSync('tmp');
      }

      // 2. ffmpeg đọc trực tiếp từ URL
      const cmd = `ffmpeg -y -i "${videoUrl}" -t 5 -vf scale=640:-2 -crf 28 -preset fast -acodec aac -b:a 64k -movflags faststart "${outputPath}"`;

      this.logger.log(`Running cmd: ${cmd}`);
      await execAsync(cmd);

      this.logger.log(`Preview created at ${outputPath}`);

      const buffer = fs.readFileSync(outputPath);

      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: previewName,
        encoding: '7bit',
        mimetype: 'video/mp4',
        size: buffer.length,
        buffer: buffer,
        destination: '',
        filename: previewName,
        path: outputPath,
        stream: undefined as any,
      };

      // 3. upload Bunny
      const result = await this.uploadService.handleUploadFile(
        file,
        FileType.FILE,
        'preview',
      );

      // 4. xóa file local
      fs.unlinkSync(outputPath);

      return result.url;
    } catch (error: any) {
      this.logger.error(`cutVideoPreview error: ${error?.message}`);
      throw error;
    }
  }
}
