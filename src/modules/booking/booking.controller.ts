import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { Booking } from 'src/modules/booking/entities/booking.entity';
import { BookingPayment } from 'src/modules/booking/entities/booking-payment.entity';
import { CreateBookingDto } from 'src/modules/booking/dto/create-booking.dto';
import { CancelBookingDto } from 'src/modules/booking/dto/cancel-booking.dto';
import {
  GetBookingDto,
  GetBookingsResponseDto,
} from 'src/modules/booking/dto/get-booking.dto';
import { BookingService } from 'src/modules/booking/booking.service';

import { formatApiResponse } from 'src/common/utils/format';
import { Admin, UserId } from 'src/common/decorators';
import { OptionalUserGuard, UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

@Controller('booking')
@ApiExtraModels(
  Booking,
  BookingPayment,
  CreateBookingDto,
  GetBookingsResponseDto,
)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiBearerAuth(USER_TOKEN)
  @UseGuards(OptionalUserGuard)
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

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get booking list',
    schema: {
      properties: {
        data: { $ref: getSchemaPath(GetBookingsResponseDto) },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetBookingDto) {
    const result = await this.bookingService.findAll(query);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'Get bookings successfully!',
    );
  }

  @Post(':id/cancel')
  @ApiBearerAuth(USER_TOKEN)
  @Admin()
  @UseGuards(UserGuard)
  @ApiParam({
    name: 'id',
    description: 'ID của booking',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  @ApiResponse({
    status: 200,
    description: 'cancel a pending booking (admin only)',
    schema: {
      properties: {
        data: { $ref: getSchemaPath(Booking) },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Booking is not pending',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
    @Body() dto: CancelBookingDto,
  ) {
    const result = await this.bookingService.cancel(id, userId, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'cancelled booking successfully',
    );
  }

  @Get(':id/payment')
  @ApiParam({
    name: 'id',
    description: 'ID của booking',
    example: '0df1ec7e-166e-4209-810a-23156b3b0489',
  })
  @ApiResponse({
    status: 200,
    description: 'get the list of payments belonging to a booking',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(BookingPayment) },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async findPayments(@Param('id') id: string) {
    const result = await this.bookingService.findPayments(id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'Get booking payments successfully',
    );
  }
}
