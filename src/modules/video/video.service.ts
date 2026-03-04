import { IsNull, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import pgvector from 'pgvector';

import { Video } from 'src/modules/video/entities/video.entity';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { EmbeddingService } from 'src/embedding/embedding.service';
import {
  GetVideoDto,
  GetVideoResponseDto,
  VideoDto,
} from 'src/modules/video/dto/get-video.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,

    private readonly embeddingService: EmbeddingService,
    private readonly configService: ConfigService,
  ) {}

  create(createVideoDto: CreateVideoDto) {
    return 'This action adds a new video';
  }

  async findAll(queryPayload: GetVideoDto): Promise<GetVideoResponseDto> {
    const { pageSize = 10, query = '', distanceScore } = queryPayload;

    const pageSizeNum = Number(pageSize);

    const videos = await this.getRecommendationVideo(
      query,
      pageSizeNum,
      distanceScore,
    );

    const maxDistanceScore = (videos[videos.length - 1]?.score as number) || 0;
    console.log(maxDistanceScore);

    const result: GetVideoResponseDto = {
      items: videos as VideoDto[],

      stats: {
        distanceScore: maxDistanceScore,
      },
    };

    console.log(result);

    return result;
  }

  findOne(id: string) {
    return `This action returns a #${id} video`;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto) {
    await this.videoRepository.update(id, updateVideoDto);
  }

  remove(id: string) {
    return `This action removes a #${id} video`;
  }

  async findEmbeddingMissing() {
    return await this.videoRepository.find({
      where: {
        embedding: IsNull(),
      },
      relations: {
        product: {
          destination: true,
        },
      },
    });
  }

  async updateVideoEmbedding(video: Video) {
    const newEmbedding =
      await this.embeddingService.generateVideoEmbedding(video);

    await this.update(video.id, { embedding: newEmbedding });
  }

  async getRecommendationVideo(
    query: string,
    limit: number,
    distanceScore?: number,
  ) {
    const embedding = await this.embeddingService.getEmbedding(query);
    const pgVectorEmbedding = pgvector.toSql(embedding) as string;

    const postgresSchema = this.configService.get<string>('POSTGRES_SCHEMA');
    await this.videoRepository.query(
      `SET search_path TO public, ${postgresSchema}`,
    );

    const videosQb = this.videoRepository
      .createQueryBuilder('v')
      .select([
        'v.id as id',
        'v.url as url',
        `v.short_url as "shortUrl"`,
        'v.thumbnail as thumbnail',
        'v.name as name',
        'v.description as description',
        'v.tag as tag',
        'v.like as like',
      ])
      .addSelect(`v.embedding <=> :queryEmbedding`, 'score')
      .where('v.embedding is not null')
      .orderBy('v.embedding <=> :queryEmbedding')
      .setParameters({
        queryEmbedding: pgVectorEmbedding,
      })
      .limit(limit);

    if (distanceScore) {
      videosQb.andWhere(`v.embedding <=> :queryEmbedding >  ${distanceScore}`);
    }
    const videos = await videosQb.getRawMany();

    return videos;
  }
}
