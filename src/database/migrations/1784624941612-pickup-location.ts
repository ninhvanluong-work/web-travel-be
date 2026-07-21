import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class PickupLocation1784624941612 implements MigrationInterface {
  name = 'PickupLocation1784624941612';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."pickup_location" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "product_id" uuid,
                "name" character varying(500) NOT NULL,
                "address" character varying(500),
                "is_popular" boolean NOT NULL DEFAULT false,
                "map_url" character varying(500),
                "order" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_PickupLocation" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location"
            ADD CONSTRAINT "FK_PickupLocation_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."pickup_location" DROP CONSTRAINT "FK_PickupLocation_Product"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."pickup_location"
        `);
  }
}
