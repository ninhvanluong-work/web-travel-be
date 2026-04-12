import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Product } from 'src/modules/product/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateRandomCode, generateSlug } from 'src/common/utils/gen-code';
import { GetProductDto } from 'src/modules/product/dto/get-product.dto';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

import { Video } from 'src/modules/video/entities/video.entity';
import { VideoType } from 'src/modules/video/video.type';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async create(payload: CreateProductDto) {
    const { name, destinationId, supplierId, heroVideoId } = payload;
    const slug = generateSlug(name);
    const code = generateRandomCode(8);

    if (destinationId) {
      const destination = await this.destinationRepository.findOne({
        where: { id: destinationId },
      });
      if (!destination) {
        throw new NotFoundException('Destination Not Found');
      }
    }

    if (supplierId) {
      const supplier = await this.supplierRepository.findOne({
        where: { id: supplierId },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier Not Found');
      }
    }

    const newProduct = this.productRepository.create({
      ...payload,
      slug,
      code,
    });

    const result = await this.productRepository.save(newProduct);
    if (heroVideoId) {
      const video = await this.videoRepository.findOne({
        where: { id: heroVideoId },
      });
      if (!video) {
        throw new NotFoundException('Video Not Found');
      }

      await this.videoRepository.update(
        {
          productId: result.id,
        },
        {
          type: VideoType.HERO,
        },
      );
    }

    return result;
  }

  buildQueryCondition(query: GetProductDto): FindOptionsWhere<Product> {
    const condition: FindOptionsWhere<Product> = {};

    if (query.keyword) {
      condition.name = ILike(`%${query.keyword}%`);
    }

    if (query.supplierId) {
      condition.supplierId = query.supplierId;
    }

    if (query.destinationId) {
      condition.destinationId = query.destinationId;
    }

    if (query.status) {
      condition.status = query.status;
    }

    if (query.fromDate && query.toDate) {
      condition.createdAt = Between(
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    } else if (query.fromDate) {
      condition.createdAt = MoreThanOrEqual(new Date(query.fromDate));
    } else if (query.toDate) {
      condition.createdAt = LessThanOrEqual(new Date(query.toDate));
    }

    return condition;
  }

  async findAll(query: GetProductDto): Promise<ListItemsResponse<Product>> {
    const { page = 1, pageSize = 10 } = query;
    console.log([page, pageSize]);
    const condition = this.buildQueryCondition(query);
    const skip = (page - 1) * pageSize;

    const [products, total] = await this.productRepository.findAndCount({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        slug: true,
        code: true,
        thumbnail: true,
        minPrice: true,
        status: true,
        reviewPoint: true,
        destination: {
          id: true,
          name: true,
        },
        supplier: {
          id: true,
          name: true,
        },
      },
      where: condition,
      take: pageSize,
      skip,
      relations: {
        supplier: true,
        destination: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const pagination: PaginationResponse = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      items: products,
      pagination,
    };
  }

  async findOne(id: string) {
    return await this.productRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { destinationId, supplierId, heroVideoId } = updateProductDto;
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Product Not Found');

    if (destinationId) {
      const destination = await this.destinationRepository.findOne({
        where: { id: destinationId },
      });
      if (!destination) {
        throw new NotFoundException('Destination Not Found');
      }
    }

    if (supplierId) {
      const supplier = await this.supplierRepository.findOne({
        where: { id: supplierId },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier Not Found');
      }
    }

    if (heroVideoId) {
      const video = await this.videoRepository.findOne({
        where: { id: heroVideoId },
      });
      if (!video) {
        throw new NotFoundException('Video Not Found');
      }

      await this.videoRepository.update(
        { productId: id },
        { type: VideoType.NORMAL },
      );

      await this.videoRepository.update(video.id, {
        type: VideoType.HERO,
        productId: id,
      });
    }

    await this.productRepository.update(id, updateProductDto);
    return await this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
