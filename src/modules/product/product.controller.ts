import {
  Controller,
  Get,
  Body,
  Param,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import { IdDto } from 'src/types/get-id.dto';

@Controller('product')
@ApiExtraModels(Product)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'create product',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('Product'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async create(@Body() createProductDto: CreateProductDto) {
    const result = await this.productService.create(createProductDto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'created product successfully',
    );
  }

  //@Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get product detail',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('Product'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.productService.findOne(id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'update product',
    schema: {
      properties: {
        data: {
          $ref: getSchemaRefPath('Product'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async update(
    @Param() param: IdDto,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const { id } = param;
    const result = await this.productService.update(id, updateProductDto);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated product successfully!',
    );
  }

  //@Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
