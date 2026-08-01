import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingMessengerApp1785510000000 implements MigrationInterface {
  name = 'BookingMessengerApp1785510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" ADD COLUMN "username" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" ADD COLUMN "messenger_app" jsonb NOT NULL DEFAULT '[]'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" ADD COLUMN "option_name" character varying(500)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "option_name"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "messenger_app"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "username"
        `);
  }
}
