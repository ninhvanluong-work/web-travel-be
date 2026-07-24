import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingDepartureFk1784903875440 implements MigrationInterface {
  name = 'BookingDepartureFk1784903875440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "departure_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "Fk_Booking_DepartureTime" FOREIGN KEY ("departure_id") REFERENCES "departure_time"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "Fk_Booking_DepartureTime"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "departure_id"
        `);
  }
}
