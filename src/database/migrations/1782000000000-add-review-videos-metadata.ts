import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class AddReviewVideosMetadata1782000000000 implements MigrationInterface {
  name = 'AddReviewVideosMetadata1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      ADD "videos" character varying array
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."review"."videos" IS 'array of videos url'
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      ADD "metadata" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      DROP COLUMN "metadata"
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${schema}"."review"."videos" IS 'array of videos url'
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      DROP COLUMN "videos"
    `);
  }
}
