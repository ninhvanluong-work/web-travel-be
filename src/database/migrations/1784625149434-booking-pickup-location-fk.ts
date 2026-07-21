import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingPickupLocationFk1784625149434 implements MigrationInterface {
  name = 'BookingPickupLocationFk1784625149434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "Fk_Booking_PickupLocation" FOREIGN KEY ("pickup_location_id") REFERENCES "pickup_location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "Fk_Booking_PickupLocation"
        `);
  }
}
