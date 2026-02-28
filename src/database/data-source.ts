import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
console.log('1');
import { getCACertificate } from 'src/common/utils/security';

dotenv.config({
  path: '.env',
});

const USE_CERT = process.env.USE_CERT === 'true';

const SSL_CONFIG = USE_CERT
  ? {
      ssl: {
        rejectUnauthorized: true,
        ca: getCACertificate(),
      },
    }
  : {};

export default new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_CONN,
  schema: process.env.POSTGRES_SCHEMA,
  logging: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  ...SSL_CONFIG,
});
