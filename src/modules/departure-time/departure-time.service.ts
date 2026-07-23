import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DepartureTime } from './entities/departure-time.entity';
import { Option } from 'src/modules/option/entities/option.entity';
import { CreateDepartureTimeDto } from './dto/create-departure-time.dto';
import { UpdateDepartureTimeDto } from './dto/update-departure-time.dto';

@Injectable()
export class DepartureTimeService {
  constructor(
    @InjectRepository(DepartureTime)
    private readonly departureTimeRepository: Repository<DepartureTime>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}

  async create(payload: CreateDepartureTimeDto) {
    const option = await this.optionRepository.findOne({
      where: { id: payload.optionId },
    });
    if (!option) throw new NotFoundException('Option Not Found');

    const newDepartureTime = this.departureTimeRepository.create(payload);
    return this.departureTimeRepository.save(newDepartureTime);
  }

  async update(id: string, payload: UpdateDepartureTimeDto) {
    const departureTime = await this.findOneById(id);
    if (!departureTime) throw new NotFoundException('Departure Time not found');

    Object.assign(departureTime, payload);
    return this.departureTimeRepository.save(departureTime);
  }

  async remove(id: string) {
    const found = await this.findOneById(id);
    if (!found) throw new NotFoundException('Departure Time not found');

    await this.departureTimeRepository.softDelete(id);
    const removed = await this.findOneById(id, true);
    if (!removed) throw new NotFoundException('Departure Time not found');
    return removed;
  }

  async findByOption(optionId: string) {
    return this.departureTimeRepository.find({
      where: { optionId },
      order: { order: 'ASC' },
    });
  }

  async findOneById(id: string, withDeleted = false) {
    return this.departureTimeRepository.findOne({
      where: { id },
      withDeleted,
    });
  }
}
