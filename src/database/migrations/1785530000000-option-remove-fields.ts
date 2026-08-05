import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class OptionRemoveFields1785530000000 implements MigrationInterface {
  name = 'OptionRemoveFields1785530000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "currency"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "is_default"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "allow_unit"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "allow_unit" uuid array
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "is_default" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "currency" character varying DEFAULT 'VND'
        `);
  }
}
