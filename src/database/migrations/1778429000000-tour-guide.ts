import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class TourGuide1778429000000 implements MigrationInterface {
  name = 'TourGuide1778429000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."tour_guide" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying(255) NOT NULL,
                "avatar" character varying,
                "rating_count" integer NOT NULL DEFAULT 0,
                "exp_year" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_TourGuide" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "${schema}"."product_tour_guide" (
                "product_id" uuid NOT NULL,
                "tour_guide_id" uuid NOT NULL,
                CONSTRAINT "PK_ProductTourGuide" PRIMARY KEY ("product_id", "tour_guide_id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tour_guide"
            ADD CONSTRAINT "Fk_ProductTourGuide_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tour_guide"
            ADD CONSTRAINT "Fk_ProductTourGuide_TourGuide" FOREIGN KEY ("tour_guide_id") REFERENCES "tour_guide"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tour_guide" DROP CONSTRAINT "Fk_ProductTourGuide_TourGuide"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product_tour_guide" DROP CONSTRAINT "Fk_ProductTourGuide_Product"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."product_tour_guide"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."tour_guide"
        `);
  }
}
