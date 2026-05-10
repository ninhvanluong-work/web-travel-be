import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { CreateSearchingDto } from './dto/create-searching.dto';
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

  async getSuggestions(keyword?: string): Promise<SuggestResult> {
    const keywordCondition = keyword ? ILike(`${keyword}%`) : undefined;

    const getHotSearchPromise = this.searchingStatRepository.find({
      where: keyword ? { query: keywordCondition } : {},
      select: { query: true, monthCount: true },
      order: { monthCount: 'DESC' },
      take: 8,
    });

    if (!keyword) {
      //just return hot search
      const hotSearches = await getHotSearchPromise;
      return { hotSearches, destinations: [], products: [] };
    }
    const getDestinationPromise = this.destinationRepository.find({
      where: { name: keywordCondition },
      select: { id: true, name: true },
      take: 2,
    });

    const getProductPromise = this.productRepository.find({
      where: { name: keywordCondition, status: ProductStatus.PUBLISHED },
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        minPrice: true,
      },
      order: { reviewPoint: 'DESC' },
      take: 2,
    });

    const [hotSearches, destinations, products] = await Promise.all([
      getHotSearchPromise,
      getDestinationPromise,
      getProductPromise,
    ]);

    return { hotSearches, destinations, products };
  }

  async getHotSearches(limit = 8) {
    return this.searchingStatRepository.find({
      select: { query: true, monthCount: true },
      order: { monthCount: 'DESC' },
      take: limit,
    });
  }

  async updateSearchingStatMonthCount() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthlyCounts: { query: string; count: string }[] =
      await this.searchingLogRepository
        .createQueryBuilder('log')
        .select('log.query', 'query')
        .addSelect('COUNT(*)', 'count')
        .where('log.created_at >= :startOfMonth', { startOfMonth })
        .andWhere('log.created_at < :endOfMonth', { endOfMonth })
        .groupBy('log.query')
        .getRawMany();

    const stats = await this.searchingStatRepository.find();
    const countMap = new Map(
      monthlyCounts.map((r) => [r.query, parseInt(r.count, 10)]),
    );

    await Promise.all(
      stats.map((stat) =>
        this.searchingStatRepository.update(stat.id, {
          monthCount: countMap.get(stat.query) ?? 0,
        }),
      ),
    );

    return monthlyCounts.length;
  }
}
