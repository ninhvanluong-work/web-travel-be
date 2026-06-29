import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UserResetPassword1782736226718 implements MigrationInterface {
  name = 'UserResetPassword1782736226718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD "reset_password_token" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD "reset_password_token_exp" TIMESTAMPTZ
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP COLUMN "reset_password_token_exp"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP COLUMN "reset_password_token"
        `);
  }
}
