import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class YearExp1778830254119 implements MigrationInterface {
  name = 'YearExp1778830254119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "responseRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "ratingCount"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "ratingRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "isVerified"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "tourOffered"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "rating_count" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "rating_rate" double precision NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "is_verified" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "tour_offered" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "response_rate" double precision NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "exp_years" integer NOT NULL DEFAULT '1'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "exp_years"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "response_rate"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "tour_offered"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "is_verified"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "rating_rate"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "rating_count"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "tourOffered" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "isVerified" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "ratingRate" double precision NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "ratingCount" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "responseRate" double precision NOT NULL DEFAULT '0'
        `);
  }
}
