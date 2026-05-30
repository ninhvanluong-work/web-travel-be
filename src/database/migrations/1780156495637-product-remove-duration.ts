import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ProductRemoveDuration1780156495637 implements MigrationInterface {
  name = 'ProductRemoveDuration1780156495637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "duration"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "duration_type"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "duration_type" character varying DEFAULT 'day'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "duration" integer NOT NULL DEFAULT '1'
        `);
  }
}
