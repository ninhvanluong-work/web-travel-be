import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UnitReferenceRenameToUnit1785488091537 implements MigrationInterface {
  name = 'UnitReferenceRenameToUnit1785488091537';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" RENAME TO "unit"
        `);
    await queryRunner.query(`
            DELETE FROM "${schema}"."unit"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" ADD COLUMN "product_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit"
            ADD CONSTRAINT "FK_Unit_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" DROP CONSTRAINT "FK_Unit_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" DROP COLUMN "product_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" RENAME TO "unit_reference"
        `);
  }
}
