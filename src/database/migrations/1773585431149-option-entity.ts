import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class OptionEntity1773585431149 implements MigrationInterface {
  name = 'OptionEntity1773585431149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."option" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "title" character varying(500) NOT NULL,
                "description" text,
                "product_id" uuid,
                CONSTRAINT "PK_Option" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."option"
            ADD CONSTRAINT "FK_Option_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."option" DROP CONSTRAINT "FK_Option_Product"
        `);

    await queryRunner.query(`
            DROP TABLE "${schema}"."option"
        `);
  }
}
