import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UploadVideoDto } from 'src/modules/upload/dto/upload-video.dto';

@Injectable()
export class UploadService {
  private readonly bunnyApiKey: string;
  private readonly bunnyLibraryId: string;

  constructor(private readonly configService: ConfigService) {
    this.bunnyApiKey = this.configService.get<'string'>(
      'BUNNY_API_KEY',
    ) as string;

    this.bunnyLibraryId = this.configService.get<'string'>(
      'BUNNY_LIBRARY_ID',
    ) as string;
  }

  async handleUploadVideo(payload: UploadVideoDto) {
    const { title } = payload;

    const response = await fetch(
      `https://video.bunnycdn.com/library/${this.bunnyLibraryId}/videos`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          AccessKey: this.bunnyApiKey,
        },
        body: JSON.stringify({ title }),
      },
    );

    const video = await response.json();
    const videoId = video.guid;
    const expirationTime = Math.floor(Date.now() / 1000) + 86400;

    const signature = crypto
      .createHash('sha256')
      .update(
        `${this.bunnyLibraryId}${this.bunnyApiKey}${expirationTime}${videoId}`,
      )
      .digest('hex');

    return {
      videoId,
      libraryId: this.bunnyLibraryId,
      expirationTime,
      signature,
    };
  }
}
