import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { VideoModule } from './modules/video/video.module';
import { TaskModule } from './modules/task/task.module';
import { ProductModule } from 'src/modules/product/product.module';
import { EmbeddingModule } from './modules/embedding/embedding.module';
import { OptionModule } from './modules/option/option.module';
import { ElementModule } from './modules/element/element.module';
import { ReviewModule } from './modules/review/review.module';
import { ItineraryModule } from 'src/modules/Itinerary/itinerary.module';
import { UploadModule } from './modules/upload/upload.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { SearchingModule } from './modules/searching/searching.module';
import { TourGuideModule } from './modules/tour-guide/tour-guide.module';
import { TagModule } from './modules/tag/tag.module';
import { DestinationModule } from './modules/destination/destination.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionModule } from './modules/session/session.module';
import { UnitModule } from './modules/unit/unit.module';
import { DepartureTimeModule } from './modules/departure-time/departure-time.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { MailModule } from 'src/common/mail/mail.module';
import { AuthGuard, OptionalUserGuard, UserGuard } from 'src/common/guards';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    // Rate limit: only applied on routes that use ThrottlerGuard explicitly
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    MailModule,
    UserModule,
    ProductModule,
    DatabaseModule,
    VideoModule,
    TaskModule,
    EmbeddingModule,
    OptionModule,
    ElementModule,
    ReviewModule,
    ItineraryModule,
    UploadModule,
    WebhookModule,
    SearchingModule,
    TourGuideModule,
    TagModule,
    DestinationModule,
    AuthModule,
    SessionModule,
    UnitModule,
    DepartureTimeModule,
    BookingModule,
    PaymentModule,
    SupplierModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserGuard,
    OptionalUserGuard,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
