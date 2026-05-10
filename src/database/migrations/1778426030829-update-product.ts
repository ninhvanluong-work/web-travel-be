import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UpdateProduct1778426030829 implements MigrationInterface {
  name = 'UpdateProduct1778426030829';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "short_description" text
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "banner" jsonb NOT NULL DEFAULT '[]'
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "${schema}"."product"."banner" IS 'array of media banner ex: [{type: image, url: "...."]'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "readBefore" jsonb NOT NULL DEFAULT '[]'
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "product"."readBefore" IS 'array of read before ex: [{key: " }]'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "review_count" integer NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "review_count"
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "product"."readBefore" IS 'array of read before ex: [{key: " }]'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "readBefore"
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "${schema}"."product"."banner" IS 'array of media banner ex: [{type: image, url: "...."]'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "banner"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "short_description"
        `);
  }
}
