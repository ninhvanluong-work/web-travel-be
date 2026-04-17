import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SearchingService } from './searching.service';
import { CreateSearchingDto } from './dto/create-searching.dto';
import { UpdateSearchingDto } from './dto/update-searching.dto';

@Controller('searching')
export class SearchingController {
  constructor(private readonly searchingService: SearchingService) {}

  @Post()
  create(@Body() createSearchingDto: CreateSearchingDto) {
    return this.searchingService.create(createSearchingDto);
  }

  @Get()
  findAll() {
    return this.searchingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSearchingDto: UpdateSearchingDto,
  ) {
    return this.searchingService.update(+id, updateSearchingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.searchingService.remove(+id);
  }
}
