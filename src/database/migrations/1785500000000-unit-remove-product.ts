import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UnitRemoveProduct1785500000000 implements MigrationInterface {
  name = 'UnitRemoveProduct1785500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" DROP CONSTRAINT "FK_Unit_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" DROP COLUMN "product_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" ADD COLUMN "product_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit"
            ADD CONSTRAINT "FK_Unit_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
