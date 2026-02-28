import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCACertificate } from 'src/common/utils/security';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const sslConfig =
          configService.get<string>('USE_CERT') === 'true'
            ? {
                ssl: {
                  rejectUnauthorized: true,
                  ca: getCACertificate(),
                },
              }
            : {};

        return {
          type: 'postgres',
          url: configService.get<string>('POSTGRES_CONN'),
          schema: configService.get<string>('POSTGRES_SCHEMA'),
          autoLoadEntities: true,
          retryAttempts: 10,
          retryDelay: 3000,
          synchronize: false,
          logging: configService.get<string>('LOGGING') === 'true',
          ...sslConfig,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
