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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

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
import { Admin } from 'src/common/decorators';
import { USER_TOKEN } from 'src/common/constants';
import { standardResponseSchema } from 'src/common/utils/swagger';

@Controller('supplier-payment')
@ApiExtraModels(SupplierPayment, GetSupplierPaymentsResponseDto)
@ApiBearerAuth(USER_TOKEN)
@Admin()
export class SupplierPaymentController {
  constructor(
    private readonly supplierPaymentService: SupplierPaymentService,
  ) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create supplier payment',
    schema: standardResponseSchema({ $ref: getSchemaPath('SupplierPayment') }),
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
    schema: standardResponseSchema({
      $ref: getSchemaPath('GetSupplierPaymentsResponseDto'),
    }),
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
    schema: standardResponseSchema({ $ref: getSchemaPath('SupplierPayment') }),
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
    schema: standardResponseSchema({ $ref: getSchemaPath('SupplierPayment') }),
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
    schema: standardResponseSchema({ type: 'null', example: null }),
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
