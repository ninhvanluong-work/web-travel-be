import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class AddProductElement1778833200000 implements MigrationInterface {
  name = 'AddProductElement1778833200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."product_element" (
                "product_id" uuid NOT NULL,
                "element_id" uuid NOT NULL,
                CONSTRAINT "PK_product_element" PRIMARY KEY ("product_id", "element_id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_element"
            ADD CONSTRAINT "FK_product_element_product" FOREIGN KEY ("product_id") REFERENCES "${schema}"."product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_element"
            ADD CONSTRAINT "FK_product_element_element" FOREIGN KEY ("element_id") REFERENCES "${schema}"."element"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_element" DROP CONSTRAINT "FK_product_element_element"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_element" DROP CONSTRAINT "FK_product_element_product"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."product_element"
        `);
  }
}
