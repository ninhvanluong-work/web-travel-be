import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ReviewImages1778422951994 implements MigrationInterface {
  name = 'ReviewImages1778422951994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."review"
            ADD "images" character varying(500) array
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "${schema}"."review"."images" IS 'array of images url'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            COMMENT ON COLUMN "${schema}". "review"."images" IS 'array of images url'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."review" DROP COLUMN "images"
        `);
  }
}
