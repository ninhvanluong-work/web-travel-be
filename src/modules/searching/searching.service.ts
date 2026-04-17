import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { CreateSearchingDto } from './dto/create-searching.dto';
import { UpdateSearchingDto } from './dto/update-searching.dto';
import { SearchingLog } from './entities/searching-log.entity';
import { SearchingStat } from './entities/searching-stat.entity';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductStatus } from 'src/modules/product/entities/product.entity';

export interface SuggestResult {
  hotSearches: { query: string; monthCount: number }[];
  destinations: { id: string; name: string }[];
  products: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    minPrice: number;
  }[];
}

@Injectable()
export class SearchingService {
  logger = new Logger(SearchingService.name);

  constructor(
    @InjectRepository(SearchingLog)
    private readonly searchingLogRepository: Repository<SearchingLog>,
    @InjectRepository(SearchingStat)
    private readonly searchingStatRepository: Repository<SearchingStat>,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createSearchingDto: CreateSearchingDto) {
    const { query = '', userId, ipAddress } = createSearchingDto;

    const prefixLog = `[create] query: ${query} ${ipAddress}`;

    const log = this.searchingLogRepository.create({
      query,
      userId,
      ipAddress,
    });
    await this.searchingLogRepository.save(log);

    this.logger.log(`${prefixLog} created searching log`);

    const existingStat = await this.searchingStatRepository.findOne({
      where: { query },
    });

    if (existingStat) {
      this.logger.log(
        `${prefixLog} searching_query already exist -> update searchingStat`,
      );

      await this.searchingStatRepository.update(existingStat.id, {
        totalCount: existingStat.totalCount + 1,
        monthCount: existingStat.monthCount + 1,
        lastSearchedAt: new Date(),
      });
    } else {
      const stat = this.searchingStatRepository.create({ query });
      await this.searchingStatRepository.save(stat);
    }

    return log;
  }

  async findOne(id: string) {
    const log = await this.searchingLogRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException('Searching log not found');
    return log;
  }

  async update(id: string, updateSearchingDto: UpdateSearchingDto) {
    await this.findOne(id);
    await this.searchingLogRepository.update(id, updateSearchingDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.searchingLogRepository.softDelete(id);
  }

  async getSuggestions(keyword?: string): Promise<SuggestResult> {
    const where = keyword ? ILike(`%${keyword}%`) : undefined;

    const [hotSearches, destinations, products] = await Promise.all([
      this.searchingStatRepository.find({
        where: keyword ? { query: where } : {},
        select: { query: true, monthCount: true },
        order: { monthCount: 'DESC' },
        take: 8,
      }),
      this.destinationRepository.find({
        where: keyword ? { name: where } : {},
        select: { id: true, name: true },
        take: 5,
      }),
      this.productRepository.find({
        where: keyword
          ? { name: where, status: ProductStatus.PUBLISHED }
          : { status: ProductStatus.PUBLISHED },
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          minPrice: true,
        },
        order: { reviewPoint: 'DESC' },
        take: 5,
      }),
    ]);

    return { hotSearches, destinations, products };
  }
}
