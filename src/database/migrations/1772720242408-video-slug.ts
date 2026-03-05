import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class VideoSlug1772720242408 implements MigrationInterface {
  name = 'VideoSlug1772720242408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video"
            ADD "slug" character varying
        `);

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS unaccent;
    `);

    await queryRunner.query(`
          UPDATE "${schema}"."video"
          SET "slug" =
            LEFT(
              LOWER(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    unaccent(name),
                    '[^\\w\\s]',
                    '',
                    'g'
                  ),
                  '\\s+',
                  '-',
                  'g'
                )
              ), 80
            )
            || '-' ||
            LEFT(id::text, 4)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video" DROP COLUMN "slug"
        `);
  }
}
