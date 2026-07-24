import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingPassengersMetadata1784902286427
  implements MigrationInterface
{
  name = 'BookingPassengersMetadata1784902286427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "adult_count"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "child_count"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "infant_count"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "adult_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "child_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "infant_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "passengers" jsonb NOT NULL DEFAULT '[]'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP COLUMN "passengers"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "infant_price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "child_price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "adult_price" numeric(12, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "infant_count" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "child_count" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD "adult_count" integer NOT NULL DEFAULT '0'
        `);
  }
}
