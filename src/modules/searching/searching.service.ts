import { Injectable } from '@nestjs/common';
import { CreateSearchingDto } from './dto/create-searching.dto';
import { UpdateSearchingDto } from './dto/update-searching.dto';

@Injectable()
export class SearchingService {
  create(createSearchingDto: CreateSearchingDto) {
    return 'This action adds a new searching';
  }

  findAll() {
    return `This action returns all searching`;
  }

  findOne(id: number) {
    return `This action returns a #${id} searching`;
  }

  update(id: number, updateSearchingDto: UpdateSearchingDto) {
    return `This action updates a #${id} searching`;
  }

  remove(id: number) {
    return `This action removes a #${id} searching`;
  }
}
