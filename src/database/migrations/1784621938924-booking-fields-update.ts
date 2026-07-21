import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingFieldsUpdate1784621938924 implements MigrationInterface {
  name = 'BookingFieldsUpdate1784621938924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "quantity"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "booking_code" character varying(50)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "UQ_Booking_BookingCode" UNIQUE ("booking_code")
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "tour_session_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "pickup_location_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "option_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "adult_count" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "child_count" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "infant_count" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "adult_price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "child_price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "infant_price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "Fk_Booking_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "Fk_Booking_Option"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "infant_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "child_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "adult_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "infant_count"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "child_count"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "adult_count"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "pickup_location_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "tour_session_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "UQ_Booking_BookingCode"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "booking_code"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "quantity" integer NOT NULL DEFAULT '1'
        `);
  }
}
