import { Controller, Get, Body, Param, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import { GetProductDetailDto } from 'src/modules/product/dto/product.dto';

@Controller('product')
@ApiExtraModels(Product)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //@Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  //@Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'get list video',
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
  async findOne(@Param() param: GetProductDetailDto) {
    const { id } = param;
    const result = await this.productService.findOne(id);
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }

  //@Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  //@Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
