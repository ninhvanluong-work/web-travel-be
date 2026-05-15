import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UserName1778831997090 implements MigrationInterface {
  name = 'UserName1778831997090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD "name" character varying(255)
        `);
  }

  public async down(): Promise<void> {}
}
