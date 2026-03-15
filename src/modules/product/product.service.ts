import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Product } from 'src/modules/product/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all product`;
  }

  async findOne(id: string) {
    return await this.productRepository.findOne({
      where: {
        id,
      },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
