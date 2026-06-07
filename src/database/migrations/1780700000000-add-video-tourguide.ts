import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class AddVideoTourGuide1780700000000 implements MigrationInterface {
  name = 'AddVideoTourGuide1780700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video"
            ADD "tour_guide_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video"
            ADD CONSTRAINT "FK_Video_TourGuide" FOREIGN KEY ("tour_guide_id") REFERENCES "${schema}"."tour_guide"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video" DROP CONSTRAINT "FK_Video_TourGuide"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video" DROP COLUMN "tour_guide_id"
        `);
  }
}
