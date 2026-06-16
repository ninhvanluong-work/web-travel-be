import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class TourGuideUsernamePassword1781576978595 implements MigrationInterface {
  name = 'TourGuideUsernamePassword1781576978595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "username" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD CONSTRAINT "UQ_TOUR_GUIDE_USERNAME" UNIQUE ("username")
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "password" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "refresh_token" character varying(500)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "refresh_token"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "password"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP CONSTRAINT "UQ_TOUR_GUIDE_USERNAME"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "username"
        `);
  }
}
