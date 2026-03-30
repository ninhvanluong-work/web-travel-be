import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pgvector from 'pgvector';

import { EmbeddingResponseDto } from 'src/modules/embedding/dto/embedding.dto';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Video } from 'src/modules/video/entities/video.entity';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly embeddingApiUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.embeddingApiUrl = this.configService.get<string>(
      'EMBEDDING_API_URL',
    ) as string;
  }

  async generateVideoEmbedding(video: Video): Promise<string> {
    const embedding = await this.getVideoEmbedding(
      video,
      video?.product,
      video?.product?.destination,
    );
    const pgVectorEmbedding = pgvector.toSql(embedding) as string;
    return pgVectorEmbedding;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const response = await this.httpService.axiosRef.post<EmbeddingResponseDto>(
      `${this.embeddingApiUrl}/embedding`,
      {
        text,
      },
    );

    const embedding = response.data?.embedding;
    return embedding;
  }

  async getVideoEmbedding(
    video: Video,
    product: Product,
    destination: Destination,
  ): Promise<number[]> {
    const payload = {
      video: {
        name: video.name,
        description: video.description,
      },
      product: {
        name: product?.name || 'empty',
        description: product?.description || 'empty',
      },
      destination: {
        name: destination?.name || 'empty',
        description: destination?.description || 'empty',
      },
    };

    const response = await this.httpService.axiosRef.post<EmbeddingResponseDto>(
      `${this.embeddingApiUrl}/embedding/video`,
      payload,
    );

    const embedding = response.data?.embedding;
    return embedding;
  }
}
