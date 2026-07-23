import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class TourSessionDepartureTimeFk1784796019298 implements MigrationInterface {
  name = 'TourSessionDepartureTimeFk1784796019298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP COLUMN "departure_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" ADD COLUMN "departure_time_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session"
            ADD CONSTRAINT "FK_TourSession_DepartureTime" FOREIGN KEY ("departure_time_id") REFERENCES "departure_time"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP CONSTRAINT "FK_TourSession_DepartureTime"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP COLUMN "departure_time_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" ADD COLUMN "departure_time" TIMESTAMP WITH TIME ZONE
        `);
  }
}
