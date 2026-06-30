import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UserRefreshTokenVersion1782829097768 implements MigrationInterface {
  name = 'UserRefreshTokenVersion1782829097768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP COLUMN "refresh_token"
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD "refresh_token_version" integer DEFAULT '1'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP COLUMN "refresh_token_version"
        `);
  }
}
