import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class OptionFieldsUpdate1784622895749 implements MigrationInterface {
  name = 'OptionFieldsUpdate1784622895749';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "adult_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "child_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "infant_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "day" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "night" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "is_default" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "status" character varying(50) NOT NULL DEFAULT 'active'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "order" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "allow_unit" uuid array
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "allow_unit"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "order"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "is_default"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "night"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "day"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "infant_price" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "child_price" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "adult_price" integer DEFAULT '0'
        `);
  }
}
