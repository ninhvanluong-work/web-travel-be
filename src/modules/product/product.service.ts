import { escapeLike } from 'src/common/utils/sql';
import { syncChildrenById } from 'src/common/utils/sync';
import { Itinerary } from './../Itinerary/entities/itinerary.entity';
import {
  ListItemsResponse,
  PaginationResponse,
} from 'src/types/pagination.dto';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  In,
  FindOneOptions,
} from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Product } from 'src/modules/product/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateRandomCode, generateSlug } from 'src/common/utils/gen-code';
import { GetProductDto } from 'src/modules/product/dto/get-product.dto';
import { Destination } from 'src/modules/destination/entities/destination.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { Tag } from 'src/modules/product/entities/tag.entity';
import { TourGuide } from 'src/modules/tour-guide/entities/tour-guide.entity';

import { Video } from 'src/modules/video/entities/video.entity';
import { VideoType } from 'src/modules/video/video.type';
import { ElementService } from 'src/modules/element/element.service';
import { HeroVideoDto } from 'src/modules/product/dto/product-detail.dto';
import ELEMENT_KEY from 'src/modules/element/element.type';
import { OptionService } from 'src/modules/option/option.service';
import {
  Option,
  OptionStatus,
} from 'src/modules/option/entities/option.entity';
import { DepartureTimeService } from 'src/modules/departure-time/departure-time.service';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';
import { EmbeddingService } from 'src/modules/embedding/embedding.service';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(PickupLocation)
    private readonly pickupLocationRepository: Repository<PickupLocation>,

    private readonly elementService: ElementService,
    private readonly optionService: OptionService,
    private readonly departureTimeService: DepartureTimeService,
    private readonly embeddingService: EmbeddingService,
    private readonly dataSource: DataSource,
  ) {}

  async checkExternalTableId(ids: {
    supplierId?: string;
    destinationId?: string;
  }) {
    const prefixLog = `[checkExternalTableId] `;
    this.logger.debug(`${prefixLog} ${JSON.stringify(ids)}`);

    const { supplierId, destinationId } = ids;
    if (destinationId) {
      this.logger.log(`${prefixLog} checking destination: ${destinationId}`);
      const destination = await this.destinationRepository.findOne({
        where: { id: destinationId },
      });
      if (!destination) {
        throw new NotFoundException('Destination Not Found');
      }
    }

    if (supplierId) {
      this.logger.log(`${prefixLog} checking supplier: ${supplierId}`);

      const supplier = await this.supplierRepository.findOne({
        where: { id: supplierId },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier Not Found');
      }
    }
  }

  async create(payload: CreateProductDto, userId: string) {
    const prefixLog = `[create] `;
    this.logger.debug(`${prefixLog} ${JSON.stringify(payload)}`);

    const {
      name,
      destinationId,
      supplierId,
      heroVideoId,
      tagIds,
      tourGuideIds,
      elementIds,
      options,
      departureTimes,
      pickupLocations,
      units,
    } = payload;
    const slug = generateSlug(name);
    const code = generateRandomCode(8);

    // destination/supplier phải tồn tại trước khi tạo product
    await this.checkExternalTableId({ destinationId, supplierId });

    // toàn bộ dữ liệu của product lưu trong 1 transaction, lỗi ở bước nào cũng rollback hết
    const { result, heroVideo } = await this.dataSource.transaction(
      async (manager) => {
        const productRepository = manager.getRepository(Product);
        const videoRepository = manager.getRepository(Video);
        const tagRepository = manager.getRepository(Tag);
        const tourGuideRepository = manager.getRepository(TourGuide);
        const pickupLocationRepository = manager.getRepository(PickupLocation);
        const unitRepository = manager.getRepository(Unit);

        const newProduct = productRepository.create({
          ...payload,
          slug,
          code,
          createdBy: userId,
          updatedBy: userId,
        });

        const result = await productRepository.save(newProduct);

        // gán video được chọn làm hero video của product vừa tạo
        let heroVideo: Video | null = null;
        if (heroVideoId) {
          this.logger.log(`${prefixLog} checking heroVideoId: ${heroVideoId}`);

          heroVideo = await videoRepository.findOne({
            where: { id: heroVideoId },
          });
          if (!heroVideo) {
            throw new NotFoundException('Video Not Found');
          }

          heroVideo.productId = result.id;
          heroVideo.type = VideoType.HERO;
          await videoRepository.save(heroVideo);
        }

        // gắn danh sách tag (quan hệ nhiều-nhiều) cho product
        if (tagIds && tagIds.length > 0) {
          this.logger.log(
            `${prefixLog} checking tagIds: ${JSON.stringify(tagIds)}`,
          );

          const tags = await tagRepository.find({
            where: {
              id: In(tagIds),
            },
          });
          if (tags.length > 0) {
            result.tags = tags;
            await productRepository.save(result);
          }
        }

        // gắn danh sách tour guide (quan hệ nhiều-nhiều) cho product
        if (tourGuideIds && tourGuideIds.length > 0) {
          this.logger.log(
            `${prefixLog} checking tour guide: ${JSON.stringify(tourGuideIds)}`,
          );

          const tourGuides = await tourGuideRepository.find({
            where: {
              id: In(tourGuideIds),
            },
          });
          if (tourGuides.length > 0) {
            result.tourGuides = tourGuides;
            await productRepository.save(result);
          }
        }

        // gắn danh sách element (quan hệ nhiều-nhiều) cho product
        if (elementIds && elementIds.length > 0) {
          this.logger.log(
            `${prefixLog} checking elementIds: ${JSON.stringify(elementIds)}`,
          );

          const elements = await this.elementService.find({
            where: {
              id: In(elementIds),
            },
          });

          if (elements.length > 0) {
            result.elements = elements;
            await productRepository.save(result);
          }
        }

        // tạo option cho product, chưa cần id vì đây là tạo mới.
        // chạy tuần tự: transaction chỉ có 1 connection, chạy song song không nhanh hơn
        if (options && options.length > 0) {
          this.logger.log(`${prefixLog} creating options: ${options.length}`);

          result.options = [];
          for (const option of options) {
            result.options.push(
              await this.optionService.create(
                { ...option, productId: result.id },
                userId,
                manager,
              ),
            );
          }
        }

        // tạo departure time cho product
        if (departureTimes && departureTimes.length > 0) {
          this.logger.log(
            `${prefixLog} creating departure times: ${departureTimes.length}`,
          );

          result.departureTimes = [];
          for (const departureTime of departureTimes) {
            result.departureTimes.push(
              await this.departureTimeService.create(
                {
                  ...departureTime,
                  productId: result.id,
                },
                userId,
                manager,
              ),
            );
          }
        }

        // tạo pickup location cho product
        if (pickupLocations && pickupLocations.length > 0) {
          this.logger.log(
            `${prefixLog} creating pickup locations: ${pickupLocations.length}`,
          );

          const newPickupLocations = pickupLocations.map((pickupLocation) => {
            const entity = pickupLocationRepository.create({
              ...pickupLocation,
              productId: result.id,
              createdBy: userId,
              updatedBy: userId,
            });
            return entity;
          });
          result.pickupLocations =
            await pickupLocationRepository.save(newPickupLocations);
        }

        // tạo unit cho product
        if (units && units.length > 0) {
          this.logger.log(`${prefixLog} creating units: ${units.length}`);

          const newUnits = units.map((unit) => {
            const entity = unitRepository.create({
              ...unit,
              productId: result.id,
              createdBy: userId,
              updatedBy: userId,
            });
            return entity;
          });
          result.units = await unitRepository.save(newUnits);
        }

        return { result, heroVideo };
      },
    );

    // tạo embedding sau khi commit: gọi service bên ngoài, lỗi không ảnh hưởng product
    if (heroVideo) {
      await this.updateHeroVideoEmbedding(heroVideo, result, prefixLog);
    }

    return result;
  }

  buildQueryCondition(query: GetProductDto): FindOptionsWhere<Product> {
    const condition: FindOptionsWhere<Product> = {};

    if (query.keyword) {
      condition.name = ILike(`%${escapeLike(query.keyword)}%`);
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

    if (query.tourGuideId) {
      condition.tourGuides = { id: query.tourGuideId };
    }

    return condition;
  }

  async findAll(query: GetProductDto): Promise<ListItemsResponse<Product>> {
    const { page = 1, pageSize = 10 } = query;

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

  async getProductDetail(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: {
        itineraries: true,
        tourGuides: true,
        tags: true,
        supplier: true,
        elements: true,
        options: true,
        departureTimes: true,
        pickupLocations: true,
        units: true,
      },
    });

    // chỉ trả về các element đang active
    if (product?.elements) {
      product.elements = product?.elements.filter((e) => e.isActive);
    }

    // lấy hero video riêng vì Video không có quan hệ trực tiếp trong relations ở trên
    if (product) {
      const productHeroVideo = await this.videoRepository.findOne({
        select: {
          id: true,
          createdAt: true,
          name: true,
          embedUrl: true,
          thumbnail: true,
        },
        where: {
          productId: id,
          type: VideoType.HERO,
        },
      });

      product.heroVideo = productHeroVideo as HeroVideoDto;
    }

    return product;
  }

  async getProductBookingInfo(id: string) {
    const product = await this.findByPk(id);
    if (!product) throw new NotFoundException('Product Not Found');

    const [departureTimes, pickupLocations, options] = await Promise.all([
      this.departureTimeService.findByProduct(id),
      this.pickupLocationRepository.find({
        where: { productId: id },
        order: { order: 'ASC' },
      }),
      this.optionService.find({
        where: { productId: id, status: OptionStatus.ACTIVE },
        order: { order: 'ASC' },
      }),
    ]);

    return { departureTimes, pickupLocations, options };
  }

  async findOne(options: FindOneOptions<Product>) {
    return this.productRepository.findOne(options);
  }

  async findByPk(id: string) {
    return this.productRepository.findOneBy({ id });
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const prefixLog = `[update] id: ${id}`;
    const {
      destinationId,
      supplierId,
      heroVideoId,
      itineraries,
      tagIds,
      tourGuideIds,
      elementIds,
      options,
      departureTimes,
      pickupLocations,
      units,
    } = updateProductDto;
    const product = await this.findByPk(id);
    if (!product) throw new NotFoundException('Product Not Found');

    await this.checkExternalTableId({ destinationId, supplierId });

    // toàn bộ thay đổi của product lưu trong 1 transaction, lỗi ở bước nào cũng rollback hết
    const heroVideo = await this.dataSource.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const videoRepository = manager.getRepository(Video);
      const itineraryRepository = manager.getRepository(Itinerary);
      const tagRepository = manager.getRepository(Tag);
      const tourGuideRepository = manager.getRepository(TourGuide);
      const pickupLocationRepository = manager.getRepository(PickupLocation);
      const unitRepository = manager.getRepository(Unit);

      // đổi hero video: bỏ hero video cũ (nếu có) rồi gán video mới làm hero
      let heroVideo: Video | null = null;
      if (heroVideoId) {
        heroVideo = await videoRepository.findOne({
          where: { id: heroVideoId },
        });
        if (!heroVideo) {
          throw new NotFoundException('Video Not Found');
        }

        await videoRepository.update(
          { productId: id },
          { type: VideoType.NORMAL },
        );

        await videoRepository.update(heroVideo.id, {
          type: VideoType.HERO,
          productId: id,
          updatedBy: userId,
        });

        delete updateProductDto.heroVideoId;
      }

      // itinerary: xoá hết bản ghi cũ và tạo lại toàn bộ từ danh sách mới (không cần theo id)
      if (itineraries) {
        await itineraryRepository.update(
          { productId: id },
          { deletedBy: userId },
        );
        await itineraryRepository.softDelete({ productId: id });
        const newItins = itineraries.map((itinerary) => {
          const entity = itineraryRepository.create({
            ...itinerary,
            productId: id,
            createdBy: userId,
            updatedBy: userId,
          });
          return entity;
        });

        //save db
        await itineraryRepository.save(newItins);

        delete updateProductDto.itineraries;
      }

      // gán lại danh sách tag (quan hệ nhiều-nhiều) cho product
      if (tagIds && tagIds?.length > 0) {
        const tags = await tagRepository.find({
          where: {
            id: In(tagIds),
          },
        });
        product.tags = tags;
        await productRepository.save(product);
        delete updateProductDto.tagIds;
      }

      // gán lại danh sách tour guide (quan hệ nhiều-nhiều) cho product
      if (tourGuideIds && tourGuideIds?.length > 0) {
        const tourGuides = await tourGuideRepository.find({
          where: {
            id: In(tourGuideIds),
          },
        });
        product.tourGuides = tourGuides;
        await productRepository.save(product);
        delete updateProductDto.tourGuideIds;
      }

      // gán lại danh sách element (quan hệ nhiều-nhiều) cho product
      if (elementIds && elementIds?.length > 0) {
        const elements = await this.elementService.find({
          where: {
            id: In(elementIds),
          },
        });
        product.elements = elements;
        await productRepository.save(product);
        delete updateProductDto.elementIds;
      }

      // đồng bộ danh sách option theo id: có id -> update phần được gửi lên,
      // không có id -> tạo mới, id cũ của product mà không còn trong danh sách -> xoá (soft delete)
      if (options !== undefined) {
        await syncChildrenById({
          items: options,
          existing: await manager.getRepository(Option).find({
            where: { productId: id },
          }),
          notFoundMessage: (optionId) => `Option ${optionId} Not Found`,
          update: (option, fields) =>
            this.optionService.update(option.id, fields, userId, manager),
          create: async (fields) => {
            // title là field bắt buộc khi tạo
            const { title, ...restFields } = fields;
            if (!title) {
              throw new BadRequestException(
                'title is required to create a new option',
              );
            }
            await this.optionService.create(
              { ...restFields, title, productId: id },
              userId,
              manager,
            );
          },
          removeMissing: async (optionsToRemove) => {
            for (const option of optionsToRemove) {
              await this.optionService.remove(option.id, userId, manager);
            }
          },
        });

        delete updateProductDto.options;
      }

      // đồng bộ danh sách departure time theo id, cùng logic như option ở trên
      if (departureTimes !== undefined) {
        await syncChildrenById({
          items: departureTimes,
          existing: await this.departureTimeService.findByProduct(id, manager),
          notFoundMessage: (departureTimeId) =>
            `Departure Time ${departureTimeId} Not Found`,
          update: (departureTime, fields) =>
            this.departureTimeService.update(
              departureTime.id,
              fields,
              userId,
              manager,
            ),
          create: async (fields) => {
            // time là field bắt buộc khi tạo
            const { time, ...restFields } = fields;
            if (!time) {
              throw new BadRequestException(
                'time is required to create a new departure time',
              );
            }
            await this.departureTimeService.create(
              { ...restFields, time, productId: id },
              userId,
              manager,
            );
          },
          removeMissing: async (departureTimesToRemove) => {
            for (const departureTime of departureTimesToRemove) {
              await this.departureTimeService.remove(
                departureTime.id,
                userId,
                manager,
              );
            }
          },
        });

        delete updateProductDto.departureTimes;
      }

      // đồng bộ danh sách pickup location theo id, cùng logic như option ở trên.
      // pickupLocation không có service riêng nên thao tác thẳng qua repository
      if (pickupLocations !== undefined) {
        await syncChildrenById({
          items: pickupLocations,
          existing: await pickupLocationRepository.find({
            where: { productId: id },
          }),
          notFoundMessage: (pickupLocationId) =>
            `Pickup Location ${pickupLocationId} Not Found`,
          update: (pickupLocation, fields) => {
            Object.assign(pickupLocation, fields, { updatedBy: userId });
            return pickupLocationRepository.save(pickupLocation);
          },
          create: async (fields) => {
            // name là field bắt buộc khi tạo
            const { name, ...restFields } = fields;
            if (!name) {
              throw new BadRequestException(
                'name is required to create a new pickup location',
              );
            }
            await pickupLocationRepository.save(
              pickupLocationRepository.create({
                ...restFields,
                name,
                productId: id,
                createdBy: userId,
                updatedBy: userId,
              }),
            );
          },
          removeMissing: async (pickupLocationsToRemove) => {
            const ids = pickupLocationsToRemove.map((p) => p.id);
            if (ids.length > 0) {
              await pickupLocationRepository.update(ids, { deletedBy: userId });
              await pickupLocationRepository.softDelete(ids);
            }
          },
        });

        delete updateProductDto.pickupLocations;
      }

      // đồng bộ danh sách unit theo id, cùng logic như option ở trên.
      // unit không có service riêng nên thao tác thẳng qua repository
      if (units !== undefined) {
        await syncChildrenById({
          items: units,
          existing: await unitRepository.find({ where: { productId: id } }),
          notFoundMessage: (unitId) => `Unit ${unitId} Not Found`,
          update: (unit, fields) => {
            Object.assign(unit, fields, { updatedBy: userId });
            return unitRepository.save(unit);
          },
          create: async (fields) => {
            // name là field bắt buộc khi tạo
            const { name, ...restFields } = fields;
            if (!name) {
              throw new BadRequestException(
                'name is required to create a new unit',
              );
            }
            await unitRepository.save(
              unitRepository.create({
                ...restFields,
                name,
                productId: id,
                createdBy: userId,
                updatedBy: userId,
              }),
            );
          },
          removeMissing: async (unitsToRemove) => {
            const ids = unitsToRemove.map((u) => u.id);
            if (ids.length > 0) {
              await unitRepository.update(ids, { deletedBy: userId });
              await unitRepository.softDelete(ids);
            }
          },
        });

        delete updateProductDto.units;
      }

      await productRepository.update(id, {
        ...updateProductDto,
        updatedBy: userId,
      });

      return heroVideo;
    });

    // tạo embedding sau khi commit: gọi service bên ngoài, lỗi không ảnh hưởng product
    if (heroVideo) {
      await this.updateHeroVideoEmbedding(heroVideo, product, prefixLog);
    }

    return await this.getProductDetail(id);
  }

  private async updateHeroVideoEmbedding(
    video: Video,
    product: Product,
    prefixLog: string,
  ) {
    try {
      video.product = product;
      const newEmbedding =
        await this.embeddingService.generateVideoEmbedding(video);
      video.embedding = newEmbedding;
      await this.videoRepository.update(video.id, {
        embedding: newEmbedding,
      });
    } catch (error: any) {
      this.logger.error(
        `${prefixLog} update video embedding error ${error?.message}`,
      );
    }
  }
}
