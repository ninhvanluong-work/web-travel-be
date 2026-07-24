import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingSnapshotFields1784903712832
  implements MigrationInterface
{
  name = 'BookingSnapshotFields1784903712832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "product_name" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "departure_time" time
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "departure_label" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "pickup_location_name" character varying(500)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "pickup_location_name"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "departure_label"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "departure_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "product_name"
        `);
  }
}
