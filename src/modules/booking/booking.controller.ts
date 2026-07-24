import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { Booking } from 'src/modules/booking/entities/booking.entity';
import { CreateBookingDto } from 'src/modules/booking/dto/create-booking.dto';
import { BookingService } from 'src/modules/booking/booking.service';

import { formatApiResponse } from 'src/common/utils/format';
import { UserId } from 'src/common/decorators';
import { UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

@Controller('booking')
@ApiExtraModels(Booking, CreateBookingDto)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiBearerAuth(USER_TOKEN)
  @UseGuards(UserGuard)
  @ApiResponse({
    status: 200,
    description: 'create booking',
    schema: {
      properties: {
        data: { $ref: getSchemaPath(Booking) },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@UserId() userId: string, @Body() dto: CreateBookingDto) {
    const result = await this.bookingService.create(userId, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created booking successfully',
    );
  }
}
