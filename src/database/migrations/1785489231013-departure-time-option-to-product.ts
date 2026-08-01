import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class DepartureTimeOptionToProduct1785489231013 implements MigrationInterface {
  name = 'DepartureTimeOptionToProduct1785489231013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" ADD COLUMN "product_id" uuid
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."departure_time" dt
            SET "product_id" = o."product_id"
            FROM "${schema}"."option" o
            WHERE o."id" = dt."option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" ALTER COLUMN "product_id" SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" DROP CONSTRAINT "FK_DepartureTime_Option"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" DROP COLUMN "option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time"
            ADD CONSTRAINT "FK_DepartureTime_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" DROP CONSTRAINT "FK_DepartureTime_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" ADD COLUMN "option_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time"
            ADD CONSTRAINT "FK_DepartureTime_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" DROP COLUMN "product_id"
        `);
  }
}
