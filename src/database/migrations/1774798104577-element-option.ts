import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ElementOption1774798104577 implements MigrationInterface {
  name = 'ElementOption1774798104577';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."element" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "key" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "description" text,
                "order" integer NOT NULL DEFAULT '0',
                "is_active" boolean NOT NULL DEFAULT true,
                "owner_id" uuid,
                "owner_type" character varying(50),
                CONSTRAINT "PK_Element" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "adult_price" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "child_price" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "infant_price" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD "currency" character varying DEFAULT 'VND'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "currency"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "infant_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "child_price"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP COLUMN "adult_price"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."element"
        `);
  }
}
