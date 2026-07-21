import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class TourSessionUnitReferenceFk1784626343451 implements MigrationInterface {
  name = 'TourSessionUnitReferenceFk1784626343451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session"
            ADD CONSTRAINT "FK_TourSession_UnitReference" FOREIGN KEY ("unit_ref_id") REFERENCES "unit_reference"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP CONSTRAINT "FK_TourSession_UnitReference"
        `);
  }
}
