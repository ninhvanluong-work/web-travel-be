import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UnitProduct1785938107196 implements MigrationInterface {
  name = 'UnitProduct1785938107196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit" ADD COLUMN "product_id" uuid
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
  }
}
