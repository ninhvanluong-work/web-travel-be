import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UpdateProduct1774798928931 implements MigrationInterface {
  name = 'UpdateProduct1774798928931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "slug" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD CONSTRAINT "UQ_Product_Slug" UNIQUE ("slug")
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "thumbnail" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "code" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "images" json
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "itinerary_image" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "duration" integer NOT NULL DEFAULT '1'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "duration_type" character varying DEFAULT 'day'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "highlight" text
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "include" text
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "exclude" text
        `);
    await queryRunner.query(`
            CREATE TYPE "${schema}"."product_status_enum" AS ENUM('draft', 'published', 'hidden')
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "status" "${schema}"."product_status_enum" NOT NULL DEFAULT 'draft'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "min_price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "review_point" double precision NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "review_point"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "min_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "${schema}"."product_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "exclude"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "include"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "highlight"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "duration_type"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "duration"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "itinerary_image"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "images"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "code"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "thumbnail"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP CONSTRAINT "UQ_Product_Slug"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "slug"
        `);
  }
}
