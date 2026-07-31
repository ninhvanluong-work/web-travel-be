import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingProductCurrency1785491900907 implements MigrationInterface {
  name = 'BookingProductCurrency1785491900907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "booking_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" ADD COLUMN "currency" character varying(10) DEFAULT 'VND'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" ADD COLUMN "currency" character varying(255) DEFAULT 'VND'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "currency"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "currency"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" ADD COLUMN "booking_date" TIMESTAMP WITH TIME ZONE
        `);
  }
}
