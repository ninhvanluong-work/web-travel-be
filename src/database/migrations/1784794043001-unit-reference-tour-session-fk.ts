import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UnitReferenceTourSessionFk1784794043001 implements MigrationInterface {
  name = 'UnitReferenceTourSessionFk1784794043001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP CONSTRAINT "FK_TourSession_UnitReference"
        `);
    await queryRunner.query(`
            DELETE FROM "${schema}"."unit_reference"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP COLUMN "key"
        `);
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
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP COLUMN "unit_ref_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP COLUMN "capacity"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP COLUMN "price"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" ADD COLUMN "price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" ADD COLUMN "capacity" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" ADD COLUMN "unit_ref_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP CONSTRAINT "FK_UnitReference_TourSession"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP COLUMN "capacity"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP COLUMN "price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" DROP COLUMN "tour_session_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."unit_reference" ADD COLUMN "key" character varying(255) NOT NULL DEFAULT ''
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session"
            ADD CONSTRAINT "FK_TourSession_UnitReference" FOREIGN KEY ("unit_ref_id") REFERENCES "unit_reference"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
