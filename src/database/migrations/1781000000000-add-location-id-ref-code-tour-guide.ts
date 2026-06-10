import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class AddLocationIdRefCodeTourGuide1781000000000 implements MigrationInterface {
  name = 'AddLocationIdRefCodeTourGuide1781000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "location_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "ref_code" character varying(50)
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."tour_guide"
            SET "ref_code" = CONCAT('TG-', SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))
            WHERE "ref_code" IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ALTER COLUMN "ref_code" SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD CONSTRAINT "UQ_TourGuide_RefCode" UNIQUE ("ref_code")
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD CONSTRAINT "FK_TourGuide_Destination" FOREIGN KEY ("location_id") REFERENCES "${schema}"."destination"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP CONSTRAINT "FK_TourGuide_Destination"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP CONSTRAINT "UQ_TourGuide_RefCode"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "ref_code"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "location_id"
        `);
  }
}
