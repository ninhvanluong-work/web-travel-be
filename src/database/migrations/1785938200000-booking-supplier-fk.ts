import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingSupplierFk1785938200000 implements MigrationInterface {
  name = 'BookingSupplierFk1785938200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "supplier_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "supplier_name" character varying(255)
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."booking" b
            SET "supplier_id" = s."id",
                "supplier_name" = s."name"
            FROM "${schema}"."product" p
            JOIN "${schema}"."supplier" s ON s."id" = p."supplier_id"
            WHERE p."id" = b."product_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "Fk_Booking_Supplier" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "Fk_Booking_Supplier"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "supplier_name"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "supplier_id"
        `);
  }
}
