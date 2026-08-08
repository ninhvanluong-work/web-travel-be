import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Session } from './entities/session.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Unit } from 'src/modules/unit/entities/unit.entity';
import { SessionUnit } from 'src/modules/session-unit/entities/session-unit.entity';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Product, Unit, SessionUnit])],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [SessionService],
})
export class SessionModule {}
