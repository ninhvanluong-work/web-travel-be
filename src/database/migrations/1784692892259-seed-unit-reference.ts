import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class SeedUnitReference1784692892259 implements MigrationInterface {
  name = 'SeedUnitReference1784692892259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "${schema}"."unit_reference" ("key", "name") VALUES
            ('adult', 'Adult'),
            ('children', 'Children'),
            ('infant', 'Infant'),
            ('people', 'People')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "${schema}"."unit_reference"
            WHERE "key" IN ('adult', 'children', 'infant', 'people')
        `);
  }
}
