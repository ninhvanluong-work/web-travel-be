import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  Not,
  Repository,
} from 'typeorm';

import { Tag } from 'src/modules/product/entities/tag.entity';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetTagDto } from './dto/get-tag.dto';
import { TagDto } from './dto/tag-response.dto';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(payload: CreateTagDto) {
    const existingTag = await this.tagRepository.findOne({
      where: { name: payload.name },
    });

    if (existingTag) {
      return existingTag;
    }

    const newTag = this.tagRepository.create(payload);
    const savedTag = await this.tagRepository.save(newTag);
    return savedTag;
  }

  async update(id: string, payload: UpdateTagDto) {
    const tag = await this.findOneById(id);
    if (!tag) throw new NotFoundException('Tag not found');

    if (payload.name) {
      const existedTag = await this.tagRepository.findOne({
        where: {
          name: payload.name,
          id: Not(id),
        },
        withDeleted: true,
      });

      if (existedTag) {
        throw new ConflictException(`Tag ${payload.name} already existed!`);
      }
    }

    Object.assign(tag, payload);
    const updatedTag = await this.tagRepository.save(tag);
    return updatedTag;
  }

  async remove(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Tag not found');

    await this.tagRepository.softDelete(id);
    const removedTag = await this.findOneById(id, true);
    if (!removedTag) throw new NotFoundException('Tag not found');
    return removedTag;
  }

  async findAll(query: GetTagDto): Promise<ListItemsResponse<Tag>> {
    const { keyword = '', page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const condition: FindOptionsWhere<Tag> = {
      name: ILike(`%${keyword}%`),
    };

    const [tags, total] = await this.tagRepository.findAndCount({
      where: condition,
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
    });

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
    return {
      items: tags,
      pagination,
    };
  }

  async findOneById(id: string, withDeleted = false) {
    return this.tagRepository.findOne({
      where: { id },
      withDeleted,
    });
  }

  async findOne(options: FindOneOptions<Tag>) {
    return this.tagRepository.findOne(options);
  }
}
