import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Product } from 'src/modules/product/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateRandomCode, generateSlug } from 'src/common/utils/gen-code';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(payload: CreateProductDto) {
    //TODO: check valid destinationId, supplierId
    const { name } = payload;
    const slug = generateSlug(name);
    const code = generateRandomCode(8);

    const newProduct = this.productRepository.create({
      ...payload,
      slug,
      code,
    });

    const result = await this.productRepository.save(newProduct);
    return result;
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
