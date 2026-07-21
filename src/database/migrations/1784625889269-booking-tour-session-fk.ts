import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingTourSessionFk1784625889269 implements MigrationInterface {
  name = 'BookingTourSessionFk1784625889269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "Fk_Booking_TourSession" FOREIGN KEY ("tour_session_id") REFERENCES "tour_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "Fk_Booking_TourSession"
        `);
  }
}
