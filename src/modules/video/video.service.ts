import { IsNull, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import pgvector from 'pgvector';

import { Video } from 'src/modules/video/entities/video.entity';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { ListItemsResponse } from 'src/types/pagination.dto';
import { GetVideoDto, VideoDto } from 'src/modules/video/dto/get-video.dto';
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

  async findAll(
    queryPayload: GetVideoDto,
  ): Promise<ListItemsResponse<VideoDto>> {
    const { page = 1, pageSize = 10, query = '' } = queryPayload;
    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);

    const offset = (pageNum - 1) * pageSizeNum;
    const a = await this.getRecommendationVideo(query, pageSize);
    //const [videos, total] = await this.videoRepository.findAndCount({
    //  select: {
    //    id: true,
    //    name: true,
    //    url: true,
    //    thumbnail: true,
    //    description: true,
    //    tag: true,
    //    like: true,
    //  },
    //  take: pageSizeNum,
    //  skip: offset,
    //  where: {},
    //  order: {
    //    createdAt: 1,
    //  },
    //});

    //pagination
    //const totalPages = Math.ceil(total / pageSizeNum);
    //const pagination = {
    //  page: pageNum,
    //  pageSize: pageSizeNum,
    //  total,
    //  totalPages,
    //};
    const pagination = {
      page: 1,
      pageSize: 10,
      total: 10,
      totalPages: 10,
    };

    //if (videos.length === 0) {
    //  return {
    //    items: [],
    //    pagination,
    //  };
    //}

    const result: ListItemsResponse<VideoDto> = {
      items: a as VideoDto[],
      pagination,
    };
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

  async getRecommendationVideo(query: string, limit: number) {
    const embedding = await this.embeddingService.getEmbedding(query);
    const pgVectorEmbedding = pgvector.toSql(embedding) as string;

    const postgresSchema = this.configService.get<string>('POSTGRES_SCHEMA');
    await this.videoRepository.query(
      `SET search_path TO public, ${postgresSchema}`,
    );

    const videos = await this.videoRepository
      .createQueryBuilder('v')
      .select([
        'v.id as id',
        'v.url as url',
        'v.thumbnail as thumbnail',
        'v.name as name',
        'v.description as description',
        'v.tag as tag',
      ])
      //.addSelect(`v.embedding <=> :queryEmbedding`, 'abc')
      .where('v.embedding is not null')
      //.andWhere('v.embedding <=> :queryEmbedding >  0.27460503578186035')
      .orderBy('v.embedding <=> :queryEmbedding')
      .setParameters({
        queryEmbedding: pgVectorEmbedding,
      })
      .limit(limit)
      .getRawMany();

    return videos;
  }
}
