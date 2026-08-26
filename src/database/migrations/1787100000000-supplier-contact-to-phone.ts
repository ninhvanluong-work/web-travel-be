import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class SupplierContactToPhone1787100000000 implements MigrationInterface {
  name = 'SupplierContactToPhone1787100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            RENAME COLUMN "contact" TO "phone"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier"
            RENAME COLUMN "phone" TO "contact"
        `);
  }
}
