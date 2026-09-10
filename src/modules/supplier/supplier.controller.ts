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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { SupplierService } from 'src/modules/supplier/supplier.service';
import { CreateSupplierDto } from 'src/modules/supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from 'src/modules/supplier/dto/update-supplier.dto';
import {
  GetSuppliersDto,
  GetSuppliersResponseDto,
} from 'src/modules/supplier/dto/get-supplier.dto';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';

import { formatApiResponse } from 'src/common/utils/format';
import { IdDto } from 'src/types/common.dto';
import { Admin, UserId } from 'src/common/decorators';
import { UserGuard } from 'src/common/guards';
import { USER_TOKEN } from 'src/common/constants';

@Controller('supplier')
@ApiExtraModels(Supplier, GetSuppliersResponseDto)
@ApiBearerAuth(USER_TOKEN)
@Admin()
@UseGuards(UserGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create supplier',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('Supplier') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() dto: CreateSupplierDto, @UserId() userId: string) {
    const result = await this.supplierService.create(dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created supplier successfully',
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get supplier list',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('GetSuppliersResponseDto') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetSuppliersDto) {
    const result = await this.supplierService.findAll(query);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'get suppliers successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get supplier by id',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('Supplier') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const result = await this.supplierService.findOneById(param.id);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'get supplier successfully',
    );
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update supplier',
    schema: {
      properties: {
        data: { $ref: getSchemaPath('Supplier') },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async update(
    @Param() param: IdDto,
    @Body() dto: UpdateSupplierDto,
    @UserId() userId: string,
  ) {
    const result = await this.supplierService.update(param.id, dto, userId);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated supplier successfully',
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'delete supplier',
    schema: {
      properties: {
        data: { type: 'null', example: null },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async remove(@Param() param: IdDto, @UserId() userId: string) {
    await this.supplierService.remove(param.id, userId);
    return formatApiResponse(
      null,
      HttpStatus.OK,
      'deleted supplier successfully',
    );
  }
}
