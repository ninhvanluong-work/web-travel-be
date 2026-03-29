import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ItineraryReview1774800807296 implements MigrationInterface {
  name = 'ItineraryReview1774800807296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."review" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "comment" text,
                "point" double precision DEFAULT '5',
                "currency" character varying DEFAULT 'VND',
                "product_id" uuid,
                "user_id" uuid,
                CONSTRAINT "PK_Review" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."itinerary" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying NOT NULL,
                "featuredName" character varying(255),
                "order" integer NOT NULL DEFAULT '1',
                "description" text,
                "product_id" uuid,
                CONSTRAINT "PK_Itinerary" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."review"
            ADD CONSTRAINT "FK_Review_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."review"
            ADD CONSTRAINT "FK_Review_User" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary"
            ADD CONSTRAINT "FK_Itinerary_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary" DROP CONSTRAINT "FK_Itinerary_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."review" DROP CONSTRAINT "FK_Review_User"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."review" DROP CONSTRAINT "FK_Review_Product"
        `);

    await queryRunner.query(`
            DROP TABLE "${schema}"."itinerary"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."review"
        `);
  }
}
