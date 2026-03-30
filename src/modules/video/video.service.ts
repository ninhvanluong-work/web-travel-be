import { IsNull, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import pgvector from 'pgvector';

import { Video } from 'src/modules/video/entities/video.entity';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { EmbeddingService } from 'src/modules/embedding/embedding.service';
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
    let videos = await this.getRecommendationVideo(queryPayload);

    const maxDistanceScore = (videos[videos.length - 1]?.score as number) || 0;

    //remove score
    videos = videos.map(({ score, ...rest }) => ({ ...rest }));
    const result: GetVideoResponseDto = {
      items: videos as VideoDto[],

      stats: {
        distanceScore: maxDistanceScore,
      },
    };

    return result;
  }

  async findOne(id: string): Promise<Video | null> {
    return await this.videoRepository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        slug: true,
        url: true,
        embedUrl: true,
        shortUrl: true,
        thumbnail: true,
        description: true,
        tag: true,
        type: true,
        like: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Video | null> {
    const result = await this.videoRepository.findOne({
      select: {
        id: true,
        slug: true,
        url: true,
        shortUrl: true,
        embedUrl: true,
        thumbnail: true,
        name: true,
        description: true,
        tag: true,
        like: true,
      },
      where: {
        slug,
      },
    });

    return result;
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

  async getRecommendationVideo(payload: GetVideoDto) {
    const {
      rootId,
      excludeIds = [],
      query = '',
      pageSize = 6,
      distanceScore,
    } = payload;
    const embedding = await this.embeddingService.getEmbedding(query);
    let pgVectorEmbedding = pgvector.toSql(embedding) as string;

    const postgresSchema = this.configService.get<string>('POSTGRES_SCHEMA');
    await this.videoRepository.query(
      `SET search_path TO public, ${postgresSchema}`,
    );

    if (rootId) {
      const rootVideo = await this.findOne(rootId);
      if (rootVideo) {
        pgVectorEmbedding = rootVideo.embedding as string;
        excludeIds.push(rootId);
      }
    }

    const videosQb = this.videoRepository
      .createQueryBuilder('v')
      .select([
        'v.id as id',
        'v.slug as slug',
        'v.url as url',
        `v.short_url as "shortUrl"`,
        `v.embed_url as "embedUrl"`,
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
      .limit(pageSize);

    if (distanceScore) {
      videosQb.andWhere(`v.embedding <=> :queryEmbedding >  ${distanceScore}`);
    }

    if (excludeIds && excludeIds.length > 0) {
      videosQb.andWhere(`v.id NOT IN (:...excludeIds)`, { excludeIds });
    }
    const videos = await videosQb.getRawMany();

    return videos;
  }

  async handleLikeVideo(id: string) {
    await this.videoRepository.increment({ id }, 'like', 1);
  }

  async handleDislikeVideo(id: string) {
    await this.videoRepository.decrement({ id }, 'like', 1);
  }
}
