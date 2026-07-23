import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class PickupLocationOptionFk1784793291002 implements MigrationInterface {
  name = 'PickupLocationOptionFk1784793291002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" DROP CONSTRAINT "FK_PickupLocation_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" RENAME COLUMN "product_id" TO "option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location"
            ADD CONSTRAINT "FK_PickupLocation_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" DROP CONSTRAINT "FK_PickupLocation_Option"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" RENAME COLUMN "option_id" TO "product_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location"
            ADD CONSTRAINT "FK_PickupLocation_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
