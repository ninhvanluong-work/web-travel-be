import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UnitReferenceDropTourSessionFk1785487569642 implements MigrationInterface {
  name = 'UnitReferenceDropTourSessionFk1785487569642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP CONSTRAINT "FK_UnitReference_TourSession"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP COLUMN "tour_session_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP COLUMN "price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP COLUMN "capacity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" ADD COLUMN "tour_session_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" ADD COLUMN "price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" ADD COLUMN "capacity" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference"
            ADD CONSTRAINT "FK_UnitReference_TourSession" FOREIGN KEY ("tour_session_id") REFERENCES "tour_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
