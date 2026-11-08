import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { buildTypeOrmSslConfig } from 'src/common/utils/security';

dotenv.config({
  path: '.env',
});

const USE_CERT = process.env.USE_CERT === 'true';

const SSL_CONFIG = buildTypeOrmSslConfig(USE_CERT);

export default new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_CONN,
  schema: process.env.POSTGRES_SCHEMA,
  logging: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  ...SSL_CONFIG,
});
