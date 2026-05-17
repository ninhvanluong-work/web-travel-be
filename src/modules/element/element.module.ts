import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Element } from './entities/element.entity';
import { ElementService } from 'src/modules/element/element.service';
import { ElementController } from 'src/modules/element/element.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Element])],
  providers: [ElementService],
  controllers: [ElementController],
})
export class ElementModule {}
