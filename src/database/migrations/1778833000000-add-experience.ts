import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class AddExperience1778833000000 implements MigrationInterface {
  name = 'AddExperience1778833000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD "experience" jsonb NOT NULL DEFAULT '[]'
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "${schema}"."product"."experience" IS 'array of experience items ex: [{imageUrl: "...", title: "...", content: "..."}]'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP COLUMN "experience"
        `);
  }
}
