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

import {
  Product,
  ProductStatus,
} from 'src/modules/product/entities/product.entity';
import { ProductService } from './product.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductDetailDto } from './dto/product-detail.dto';
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
import { UpdateProductStatusDto } from 'src/modules/product/dto/update-product-status.dto';

@Controller('product')
@ApiExtraModels(
  Product,
  ProductDetailDto,
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
          $ref: getSchemaRefPath('ProductDetailDto'),
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findOne(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.productService.getProductDetail(id);
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

  @Post(':id/publish')
  @ApiResponse({
    status: 200,
    description: 'publish product',
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
  async publish(@Param() param: IdDto) {
    const { id } = param;
    const result = await this.productService.update(id, {
      status: ProductStatus.PUBLISHED,
    });
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'published product successfully!',
    );
  }

  @Post(':id/status/:status')
  @ApiResponse({
    status: 200,
    description: 'update product status',
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
  async updateStatus(@Param() param: UpdateProductStatusDto) {
    const { id, status } = param;
    const result = await this.productService.update(id, {
      status,
    });
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'updated product status successfully!',
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
