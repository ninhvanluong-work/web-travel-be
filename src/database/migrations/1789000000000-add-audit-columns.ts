import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

const tables = [
  'product',
  'destination',
  'element',
  'itinerary',
  'option',
  'pickup_location',
  'supplier',
  'tour_guide',
  'unit',
  'tag',
  'video',
  'departure_time',
  'session',
];

export class AddAuditColumns1789000000000 implements MigrationInterface {
  name = 'AddAuditColumns1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of tables) {
      await queryRunner.query(`
                ALTER TABLE "${schema}"."${table}"
                ADD COLUMN "created_by" uuid,
                ADD COLUMN "updated_by" uuid,
                ADD COLUMN "deleted_by" uuid
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of tables) {
      await queryRunner.query(`
                ALTER TABLE "${schema}"."${table}"
                DROP COLUMN "created_by",
                DROP COLUMN "updated_by",
                DROP COLUMN "deleted_by"
            `);
    }
  }
}
