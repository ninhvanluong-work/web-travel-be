import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ReviewTourGuide1780600000000 implements MigrationInterface {
  name = 'ReviewTourGuide1780600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      ADD "tour_guide_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      ADD CONSTRAINT "FK_Review_TourGuide"
      FOREIGN KEY ("tour_guide_id")
      REFERENCES "${schema}"."tour_guide"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      DROP CONSTRAINT "FK_Review_TourGuide"
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."review"
      DROP COLUMN "tour_guide_id"
    `);
  }
}
