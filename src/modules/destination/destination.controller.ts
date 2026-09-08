import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DestinationService } from './destination.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Admin } from 'src/common/decorators';
import { UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Post()
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  create(@Body() createDestinationDto: CreateDestinationDto) {
    return this.destinationService.create(createDestinationDto);
  }

  @Get()
  findAll() {
    return this.destinationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinationService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  update(
    @Param('id') id: string,
    @Body() updateDestinationDto: UpdateDestinationDto,
  ) {
    return this.destinationService.update(+id, updateDestinationDto);
  }

  @Delete(':id')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  remove(@Param('id') id: string) {
    return this.destinationService.remove(+id);
  }
}
