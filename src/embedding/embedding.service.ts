import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pgvector from 'pgvector';

import { EmbeddingResponseDto } from 'src/embedding/dto/embedding.dto';
import { Video } from 'src/modules/video/entities/video.entity';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateVideoEmbedding(video: Video): Promise<string> {
    const embeddingContent =
      `${video.name} ${video.description}` +
      `\n${video?.product?.name} ${video?.product?.description}` +
      `\n${video?.product?.destination?.name} ${video?.product?.destination?.description}`;

    this.logger.debug(
      `[generateVideoEmbedding] video: ${video.id} ${embeddingContent}`,
    );

    const embedding = await this.getEmbedding(embeddingContent);
    const pgVectorEmbedding = pgvector.toSql(embedding) as string;
    return pgVectorEmbedding;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const embeddingApiUrl = this.configService.get<string>('EMBEDDING_API_URL');
    const response = await this.httpService.axiosRef.post<EmbeddingResponseDto>(
      `${embeddingApiUrl}/embed`,
      {
        text,
      },
    );

    const embedding = response.data?.embedding;
    return embedding;
  }
}
