import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class AddRatingStar1778429000001 implements MigrationInterface {
  name = 'AddRatingStar1778429000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD COLUMN "rating_star" real NOT NULL DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            DROP COLUMN "rating_star"
        `);
  }
}
