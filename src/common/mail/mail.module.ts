import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from 'src/common/mail/mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.getOrThrow('SMPT_USER'),
            pass: configService.getOrThrow('SMPT_APP_PASSWORD'),
          },
        },
        defaults: {
          from: `"Web Travel VVV" <${configService.getOrThrow('SMPT_USER')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailerModule, MailService],
})
export class MailModule {}
