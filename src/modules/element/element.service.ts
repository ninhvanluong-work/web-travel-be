import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Not,
  Repository,
  ILike,
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';
import { Element } from './entities/element.entity';
import { CreateElementDto } from './dto/create-element.dto';
import { UpdateElementDto } from './dto/update-element.dto';
import { GetElementDto } from './dto/get-element.dto';

@Injectable()
export class ElementService {
  constructor(
    @InjectRepository(Element)
    private readonly elementRepository: Repository<Element>,
  ) {}

  async create(payload: CreateElementDto) {
    const element = await this.elementRepository.findOne({
      where: { key: payload.key, name: payload.name },
    });
    if (element) {
      return element;
    }

    const newElement = this.elementRepository.create(payload);
    return this.elementRepository.save(newElement);
  }

  async update(id: string, payload: UpdateElementDto) {
    const element = await this.elementRepository.findOne({ where: { id } });
    if (!element) throw new NotFoundException('Element not found');
    //check name value
    if (payload.name) {
      const existedElement = await this.elementRepository.findOne({
        where: {
          key: element.key,
          name: payload.name,
          id: Not(id),
        },
      });

      if (existedElement) {
        throw new ConflictException(
          `Element ${element.key} - ${payload.name} already existed!`,
        );
      }
    }

    Object.assign(element, payload);
    return this.elementRepository.save(element);
  }

  async remove(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Element not found');
    found.isActive = false;
    return this.elementRepository.save(found);
  }

  async activate(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Element not found');
    found.isActive = true;
    return this.elementRepository.save(found);
  }

  async findAll(query: GetElementDto) {
    const { keyword = '', isActive } = query;

    let condition: FindOptionsWhere<Element>[] = [
      {
        name: ILike(`%${keyword}%`),
      },
      {
        key: ILike(`%${keyword}%`),
      },
    ];

    if (typeof isActive !== 'undefined') {
      condition = condition.map((c) => ({
        ...c,
        isActive: isActive === 'true',
      }));
    }

    return this.elementRepository.find({ where: condition });
  }

  async findOneById(id: string) {
    return this.elementRepository.findOne({ where: { id } });
  }

  async find(options?: FindManyOptions<Element>) {
    return this.elementRepository.find(options);
  }

  async findOne(options: FindOneOptions<Element>) {
    return this.elementRepository.findOne(options);
  }
}
