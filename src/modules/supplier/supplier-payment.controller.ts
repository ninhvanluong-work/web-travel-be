import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { SupplierPaymentService } from 'src/modules/supplier/supplier-payment.service';
import { CreateSupplierPaymentDto } from 'src/modules/supplier/dto/create-supplier-payment.dto';
import { UpdateSupplierPaymentDto } from 'src/modules/supplier/dto/update-supplier-payment.dto';
import {
  GetSupplierPaymentsDto,
  GetSupplierPaymentsResponseDto,
} from 'src/modules/supplier/dto/get-supplier-payment.dto';
import { SupplierPayment } from 'src/modules/supplier/entities/supplier-payment.entity';

import { formatApiResponse } from 'src/common/utils/format';
import { IdDto } from 'src/types/common.dto';

@Controller('supplier-payment')
@ApiExtraModels(SupplierPayment, GetSupplierPaymentsResponseDto)
export class SupplierPaymentController {
  constructor(
    private readonly supplierPaymentService: SupplierPaymentService,
  ) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create supplier payment',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('SupplierPayment') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateSupplierPaymentDto) {
    const result = await this.supplierPaymentService.create(dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created supplier payment successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get supplier payment list',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetSupplierPaymentsResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetSupplierPaymentsDto) {
    const result = await this.supplierPaymentService.findAll(query);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'get supplier payments successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get supplier payment by id',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('SupplierPayment') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const result = await this.supplierPaymentService.findOneById(param.id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'get supplier payment successfully',
    );
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update supplier payment',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('SupplierPayment') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async update(@Param() param: IdDto, @Body() dto: UpdateSupplierPaymentDto) {
    const result = await this.supplierPaymentService.update(param.id, dto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated supplier payment successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'delete supplier payment',
    schema: {
      properties: {
        data: { type: 'null', example: null },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async remove(@Param() param: IdDto) {
    await this.supplierPaymentService.remove(param.id);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'deleted supplier payment successfully',
    );
  }
}
