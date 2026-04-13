import {
  Controller,
  Get,
  Body,
  Param,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

import { Product } from 'src/modules/product/entities/product.entity';
import { ProductService } from './product.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IdDto } from 'src/types/common.dto';
import {
  GetProductDto,
  GetProductsResponseDto,
  ProductShortResponseDto,
} from 'src/modules/product/dto/get-product.dto';

import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import {
  GetProductReviewsDto,
  GetReviewsResponseDto,
} from 'src/modules/review/dto/get-review.dto';
import { ReviewService } from 'src/modules/review/review.service';

@Controller('product')
@ApiExtraModels(
  Product,
  GetProductsResponseDto,
  ProductShortResponseDto,
  GetReviewsResponseDto,
  GetProductReviewsDto,
)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
  ) {}

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

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get product list',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaRefPath('GetProductsResponseDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetProductDto) {
    const result = await this.productService.findAll(query);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'Get products successfully!',
    );
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

  @Get(':id/review')
  @ApiResponse({
    status: 200,
    description: 'get product reviews',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaRefPath('GetReviewsResponseDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findProductReview(
    @Param() param: IdDto,
    @Query() query: GetProductReviewsDto,
  ) {
    const { id } = param;
    const result = await this.reviewService.getProductReviews(id, query);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }
}
