import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class PickupLocationOptionToProduct1785489779082 implements MigrationInterface {
  name = 'PickupLocationOptionToProduct1785489779082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" ADD COLUMN "product_id" uuid
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."pickup_location" pl
            SET "product_id" = o."product_id"
            FROM "${schema}"."option" o
            WHERE o."id" = pl."option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" ALTER COLUMN "product_id" SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" DROP CONSTRAINT "FK_PickupLocation_Option"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" DROP COLUMN "option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location"
            ADD CONSTRAINT "FK_PickupLocation_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" DROP CONSTRAINT "FK_PickupLocation_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" ADD COLUMN "option_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location"
            ADD CONSTRAINT "FK_PickupLocation_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" DROP COLUMN "product_id"
        `);
  }
}
