import { FindManyOptions, IsNull, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Video } from 'src/modules/video/entities/video.entity';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,

    private readonly embeddingService: EmbeddingService,
  ) {}

  create(createVideoDto: CreateVideoDto) {
    return 'This action adds a new video';
  }

  async findAll(payload: FindManyOptions<Video>) {
    const result = await this.videoRepository.find(payload);
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
    return await this.findAll({
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
}
