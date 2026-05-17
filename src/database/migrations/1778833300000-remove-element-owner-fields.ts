import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class RemoveElementOwnerFields1778833300000 implements MigrationInterface {
  name = 'RemoveElementOwnerFields1778833300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."element"
            DROP COLUMN IF EXISTS "owner_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."element"
            DROP COLUMN IF EXISTS "owner_type"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."element"
            ADD "owner_type" character varying(50)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."element"
            ADD "owner_id" uuid
        `);
  }
}
