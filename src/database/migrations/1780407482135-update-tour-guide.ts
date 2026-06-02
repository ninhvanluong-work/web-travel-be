import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UpdateTourGuide1780407482135 implements MigrationInterface {
  name = 'UpdateTourGuide1780407482135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "rating_star"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "rating_value" double precision NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "quote" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "cover_img" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "summary" text
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "languages" character varying(50) array
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "supplier_review" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "user_review" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "career_path" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tour_guide"
            ADD "type" character varying(50) NOT NULL DEFAULT 'refer'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tour_guide" DROP COLUMN "type"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "career_path"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "user_review"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "supplier_review"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "languages"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "summary"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "cover_img"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "quote"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "rating_value"
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "rating_star" real NOT NULL DEFAULT '0'
        `);
  }
}
