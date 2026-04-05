import { BadRequestException, Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as BunnyStorageSDK from '@bunny.net/storage-sdk';
import 'multer';
import { Readable } from 'stream';

import { UploadVideoDto } from 'src/modules/upload/dto/upload-video.dto';
import { FileType } from 'src/modules/upload/upload.type';

@Injectable()
export class UploadService {
  private readonly bunnyApiKey: string;
  private readonly bunnyLibraryId: string;
  private readonly bunnyStorageZone: string;
  private readonly bunnyStorageAccessKey: string;
  private readonly storageZone: BunnyStorageSDK.StorageZone;

  constructor(private readonly configService: ConfigService) {
    this.bunnyApiKey = this.configService.get<'string'>(
      'BUNNY_API_KEY',
    ) as string;

    this.bunnyLibraryId = this.configService.get<'string'>(
      'BUNNY_LIBRARY_ID',
    ) as string;

    this.bunnyStorageZone = this.configService.get<'string'>(
      'BUNNY_STORAGE_ZONE',
    ) as string;
    this.bunnyStorageAccessKey = this.configService.get<'string'>(
      'BUNNY_STORAGE_ACCESS_KEY',
    ) as string;

    this.storageZone = BunnyStorageSDK.zone.connect_with_accesskey(
      BunnyStorageSDK.regions.StorageRegion.Falkenstein,
      this.bunnyStorageZone,
      this.bunnyStorageAccessKey,
    );
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

  async handleUploadFile(
    file: Express.Multer.File,
    fileType: FileType,
  ): Promise<{
    fileType: FileType;
    url: string;
  }> {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ext) {
      throw new BadRequestException('Invalid file extension');
    }
    // define whitelist
    const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

    // validate theo fileType
    if (fileType === FileType.IMG) {
      if (!IMAGE_EXTS.includes(ext)) {
        throw new BadRequestException(
          `Invalid image file. Allowed: ${IMAGE_EXTS.join(', ')}`,
        );
      }
    }

    if (fileType === FileType.FILE) {
      if (VIDEO_EXTS.includes(ext)) {
        throw new BadRequestException(
          'Video files are not allowed in this API. Please use the video upload API.',
        );
      }
    }

    // create file path
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime();
    const fileName = `wt_${timestamp}.${ext}`;
    const path = `${fileType}/${year}/${month}/${fileName}`;

    // convert sang Web Stream
    const nodeStream = Readable.from(file.buffer);
    const webStream = Readable.toWeb(nodeStream);
    await BunnyStorageSDK.file.upload(this.storageZone, path, webStream);

    //get url
    const fileServerUri = this.configService.get<'STRING'>('FILE_SERVER_URI');
    const url = `${fileServerUri}/${path}`;
    return {
      fileType,
      url,
    };
  }
}
