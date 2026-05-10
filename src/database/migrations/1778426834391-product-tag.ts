import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ProductTag1778426834391 implements MigrationInterface {
  name = 'ProductTag1778426834391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."tag" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying(255) NOT NULL,
                CONSTRAINT "UQ_Tag_Name" UNIQUE ("name"),
                CONSTRAINT "PK_Tag" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "${schema}"."product_tag" (
                "product_id" uuid NOT NULL,
                "tag_id" uuid NOT NULL,
                CONSTRAINT "PK_ProductTag" PRIMARY KEY ("product_id", "tag_id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tag"
            ADD CONSTRAINT "Fk_ProductTag_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tag"
            ADD CONSTRAINT "Fk_ProductTag_Tag" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tag" DROP CONSTRAINT "Fk_ProductTag_Tag"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tag" DROP CONSTRAINT "Fk_ProductTag_Product"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."product_tag"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."tag"
        `);
  }
}
