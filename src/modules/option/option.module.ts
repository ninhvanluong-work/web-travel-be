import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Option } from './entities/option.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { OptionService } from './option.service';
import { OptionController } from './option.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Option, Product])],
  providers: [OptionService],
  controllers: [OptionController],
  exports: [OptionService],
})
export class OptionModule {}
