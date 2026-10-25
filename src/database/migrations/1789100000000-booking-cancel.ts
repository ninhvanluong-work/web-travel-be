import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingCancel1789100000000 implements MigrationInterface {
  name = 'BookingCancel1789100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD COLUMN "cancel_reason" character varying(500),
            ADD COLUMN "cancelled_at" TIMESTAMP WITH TIME ZONE,
            ADD COLUMN "cancelled_by" uuid
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            DROP COLUMN "cancel_reason",
            DROP COLUMN "cancelled_at",
            DROP COLUMN "cancelled_by"
        `);
  }
}
