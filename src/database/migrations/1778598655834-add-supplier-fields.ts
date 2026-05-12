import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class AddSupplierFields1778598655834 implements MigrationInterface {
  name = 'AddSupplierFields1778598655834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "avatar" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "ratingCount" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "ratingRate" double precision NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "isVerified" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "tourOffered" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            ADD "responseRate" double precision NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "responseRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "tourOffered"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "isVerified"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "ratingRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "ratingCount"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier" DROP COLUMN "avatar"
        `);
  }
}
