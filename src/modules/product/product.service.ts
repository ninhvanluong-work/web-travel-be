import { Itinerary } from './../Itinerary/entities/itinerary.entity';
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
import { OptionStatus } from 'src/modules/option/entities/option.entity';
import { DepartureTimeService } from 'src/modules/departure-time/departure-time.service';
import { PickupLocation } from 'src/modules/pickup-location/entities/pickup-location.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';

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
    @InjectRepository(Itinerary)
    private readonly itineraryRepository: Repository<Itinerary>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(TourGuide)
    private readonly tourGuideRepository: Repository<TourGuide>,
    @InjectRepository(PickupLocation)
    private readonly pickupLocationRepository: Repository<PickupLocation>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,

    private readonly elementService: ElementService,
    private readonly optionService: OptionService,
    private readonly departureTimeService: DepartureTimeService,
  ) {}

  async create(payload: CreateProductDto) {
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

    const newProduct = this.productRepository.create({
      ...payload,
      slug,
      code,
    });

    const result = await this.productRepository.save(newProduct);

    // gán video được chọn làm hero video của product vừa tạo
    if (heroVideoId) {
      this.logger.log(`${prefixLog} checking heroVideoId: ${heroVideoId}`);

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

    // gắn danh sách tag (quan hệ nhiều-nhiều) cho product
    if (tagIds && tagIds.length > 0) {
      this.logger.log(
        `${prefixLog} checking tagIds: ${JSON.stringify(tagIds)}`,
      );

      const tags = await this.tagRepository.find({
        where: {
          id: In(tagIds),
        },
      });
      if (tags.length > 0) {
        result.tags = tags;
        await this.productRepository.save(result);
      }
    }

    // gắn danh sách tour guide (quan hệ nhiều-nhiều) cho product
    if (tourGuideIds && tourGuideIds.length > 0) {
      this.logger.log(
        `${prefixLog} checking tour guide: ${JSON.stringify(tourGuideIds)}`,
      );

      const tourGuides = await this.tourGuideRepository.find({
        where: {
          id: In(tourGuideIds),
        },
      });
      if (tourGuides.length > 0) {
        result.tourGuides = tourGuides;
        await this.productRepository.save(result);
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
        await this.productRepository.save(result);
      }
    }

    // tạo option cho product, chưa cần id vì đây là tạo mới
    if (options && options.length > 0) {
      this.logger.log(`${prefixLog} creating options: ${options.length}`);

      result.options = await Promise.all(
        options.map((option) =>
          this.optionService.create({ ...option, productId: result.id }),
        ),
      );
    }

    // tạo departure time cho product
    if (departureTimes && departureTimes.length > 0) {
      this.logger.log(
        `${prefixLog} creating departure times: ${departureTimes.length}`,
      );

      result.departureTimes = await Promise.all(
        departureTimes.map((departureTime) =>
          this.departureTimeService.create({
            ...departureTime,
            productId: result.id,
          }),
        ),
      );
    }

    // tạo pickup location cho product
    if (pickupLocations && pickupLocations.length > 0) {
      this.logger.log(
        `${prefixLog} creating pickup locations: ${pickupLocations.length}`,
      );

      const newPickupLocations = pickupLocations.map((pickupLocation) =>
        this.pickupLocationRepository.create({
          ...pickupLocation,
          productId: result.id,
        }),
      );
      result.pickupLocations =
        await this.pickupLocationRepository.save(newPickupLocations);
    }

    // tạo unit cho product
    if (units && units.length > 0) {
      this.logger.log(`${prefixLog} creating units: ${units.length}`);

      const newUnits = units.map((unit) =>
        this.unitRepository.create({ ...unit, productId: result.id }),
      );
      result.units = await this.unitRepository.save(newUnits);
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

  async update(id: string, updateProductDto: UpdateProductDto) {
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

    // đổi hero video: bỏ hero video cũ (nếu có) rồi gán video mới làm hero
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

      delete updateProductDto.heroVideoId;
    }

    // itinerary: xoá hết bản ghi cũ và tạo lại toàn bộ từ danh sách mới (không cần theo id)
    if (itineraries) {
      await this.itineraryRepository.softDelete({ productId: id });
      const newItins = itineraries.map((itinerary) =>
        this.itineraryRepository.create({
          ...itinerary,
          productId: id,
        }),
      );

      //save db
      await this.itineraryRepository.save(newItins);

      delete updateProductDto.itineraries;
    }

    // gán lại danh sách tag (quan hệ nhiều-nhiều) cho product
    if (tagIds && tagIds?.length > 0) {
      const tags = await this.tagRepository.find({
        where: {
          id: In(tagIds),
        },
      });
      product.tags = tags;
      await this.productRepository.save(product);
      delete updateProductDto.tagIds;
    }

    // gán lại danh sách tour guide (quan hệ nhiều-nhiều) cho product
    if (tourGuideIds && tourGuideIds?.length > 0) {
      const tourGuides = await this.tourGuideRepository.find({
        where: {
          id: In(tourGuideIds),
        },
      });
      product.tourGuides = tourGuides;
      await this.productRepository.save(product);
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
      await this.productRepository.save(product);
      delete updateProductDto.elementIds;
    }

    // đồng bộ danh sách option theo id: có id -> update phần được gửi lên,
    // không có id -> tạo mới, id cũ của product mà không còn trong danh sách -> xoá (soft delete)
    if (options !== undefined) {
      const existingOptions = await this.optionService.find({
        where: { productId: id },
      });
      const existingIds = new Set(existingOptions.map((o) => o.id));
      const keepIds = new Set<string>();

      for (const option of options) {
        const { id: optionId, ...fields } = option;
        if (optionId) {
          // có id -> update option đã tồn tại, phải thuộc đúng product này
          if (!existingIds.has(optionId)) {
            throw new NotFoundException(`Option ${optionId} Not Found`);
          }
          keepIds.add(optionId);
          await this.optionService.update(optionId, fields);
        } else {
          // không có id -> tạo option mới, title là field bắt buộc khi tạo
          const { title, ...restFields } = fields;
          if (!title) {
            throw new BadRequestException(
              'title is required to create a new option',
            );
          }
          await this.optionService.create({
            ...restFields,
            title,
            productId: id,
          });
        }
      }

      // option cũ của product mà không nằm trong danh sách gửi lên -> xoá
      const optionsToRemove = existingOptions.filter((o) => !keepIds.has(o.id));
      for (const option of optionsToRemove) {
        await this.optionService.remove(option.id);
      }

      delete updateProductDto.options;
    }

    // đồng bộ danh sách departure time theo id, cùng logic như option ở trên
    if (departureTimes !== undefined) {
      const existingDepartureTimes =
        await this.departureTimeService.findByProduct(id);
      const existingIds = new Set(existingDepartureTimes.map((d) => d.id));
      const keepIds = new Set<string>();

      for (const departureTime of departureTimes) {
        const { id: departureTimeId, ...fields } = departureTime;
        if (departureTimeId) {
          // có id -> update, phải thuộc đúng product này
          if (!existingIds.has(departureTimeId)) {
            throw new NotFoundException(
              `Departure Time ${departureTimeId} Not Found`,
            );
          }
          keepIds.add(departureTimeId);
          await this.departureTimeService.update(departureTimeId, fields);
        } else {
          // không có id -> tạo mới, time là field bắt buộc khi tạo
          const { time, ...restFields } = fields;
          if (!time) {
            throw new BadRequestException(
              'time is required to create a new departure time',
            );
          }
          await this.departureTimeService.create({
            ...restFields,
            time,
            productId: id,
          });
        }
      }

      // departure time cũ không còn trong danh sách gửi lên -> xoá
      const departureTimesToRemove = existingDepartureTimes.filter(
        (d) => !keepIds.has(d.id),
      );
      for (const departureTime of departureTimesToRemove) {
        await this.departureTimeService.remove(departureTime.id);
      }

      delete updateProductDto.departureTimes;
    }

    // đồng bộ danh sách pickup location theo id, cùng logic như option ở trên.
    // pickupLocation không có service riêng nên thao tác thẳng qua repository
    if (pickupLocations !== undefined) {
      const existingPickupLocations = await this.pickupLocationRepository.find({
        where: { productId: id },
      });
      const keepIds = new Set<string>();

      for (const pickupLocation of pickupLocations) {
        const { id: pickupLocationId, ...fields } = pickupLocation;
        if (pickupLocationId) {
          // có id -> update, phải thuộc đúng product này
          const existing = existingPickupLocations.find(
            (p) => p.id === pickupLocationId,
          );
          if (!existing) {
            throw new NotFoundException(
              `Pickup Location ${pickupLocationId} Not Found`,
            );
          }
          keepIds.add(pickupLocationId);
          Object.assign(existing, fields);
          await this.pickupLocationRepository.save(existing);
        } else {
          // không có id -> tạo mới, name là field bắt buộc khi tạo
          const { name, ...restFields } = fields;
          if (!name) {
            throw new BadRequestException(
              'name is required to create a new pickup location',
            );
          }
          const newPickupLocation = this.pickupLocationRepository.create({
            ...restFields,
            name,
            productId: id,
          });
          await this.pickupLocationRepository.save(newPickupLocation);
        }
      }

      // pickup location cũ không còn trong danh sách gửi lên -> xoá
      const pickupLocationIdsToRemove = existingPickupLocations
        .filter((p) => !keepIds.has(p.id))
        .map((p) => p.id);
      if (pickupLocationIdsToRemove.length > 0) {
        await this.pickupLocationRepository.softDelete(
          pickupLocationIdsToRemove,
        );
      }

      delete updateProductDto.pickupLocations;
    }

    // đồng bộ danh sách unit theo id, cùng logic như option ở trên.
    // unit không có service riêng nên thao tác thẳng qua repository
    if (units !== undefined) {
      const existingUnits = await this.unitRepository.find({
        where: { productId: id },
      });
      const keepIds = new Set<string>();

      for (const unit of units) {
        const { id: unitId, ...fields } = unit;
        if (unitId) {
          // có id -> update, phải thuộc đúng product này
          const existing = existingUnits.find((u) => u.id === unitId);
          if (!existing) {
            throw new NotFoundException(`Unit ${unitId} Not Found`);
          }
          keepIds.add(unitId);
          Object.assign(existing, fields);
          await this.unitRepository.save(existing);
        } else {
          // không có id -> tạo mới, name là field bắt buộc khi tạo
          const { name, ...restFields } = fields;
          if (!name) {
            throw new BadRequestException(
              'name is required to create a new unit',
            );
          }
          const newUnit = this.unitRepository.create({
            ...restFields,
            name,
            productId: id,
          });
          await this.unitRepository.save(newUnit);
        }
      }

      // unit cũ không còn trong danh sách gửi lên -> xoá
      const unitIdsToRemove = existingUnits
        .filter((u) => !keepIds.has(u.id))
        .map((u) => u.id);
      if (unitIdsToRemove.length > 0) {
        await this.unitRepository.softDelete(unitIdsToRemove);
      }

      delete updateProductDto.units;
    }

    await this.productRepository.update(id, updateProductDto);
    return await this.getProductDetail(id);
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
