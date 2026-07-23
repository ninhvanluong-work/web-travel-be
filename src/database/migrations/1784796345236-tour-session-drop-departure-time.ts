import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class TourSessionDropDepartureTime1784796345236 implements MigrationInterface {
  name = 'TourSessionDropDepartureTime1784796345236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP CONSTRAINT "FK_TourSession_DepartureTime"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP COLUMN "departure_time_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" ADD COLUMN "departure_time_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session"
            ADD CONSTRAINT "FK_TourSession_DepartureTime" FOREIGN KEY ("departure_time_id") REFERENCES "departure_time"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
