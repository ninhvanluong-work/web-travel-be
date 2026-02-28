import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class Init1772294941040 implements MigrationInterface {
  name = 'Init1772294941040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    await queryRunner.query(`
            CREATE TABLE "${schema}"."destination" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying(255) NOT NULL,
                "description" text,
                CONSTRAINT "PK_Destination" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."supplier" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying(255) NOT NULL,
                "contact" character varying,
                CONSTRAINT "PK_Supplier" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "ip_address" character varying(255),
                "email" character varying(255),
                CONSTRAINT "UQ_User_Email" UNIQUE ("email"),
                CONSTRAINT "PK_User" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "${schema}"."booking" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "booking_date" TIMESTAMP WITH TIME ZONE,
                "travel_date" TIMESTAMP WITH TIME ZONE,
                "quantity" integer NOT NULL DEFAULT '1',
                "total_price" numeric(12, 2) NOT NULL DEFAULT '0',
                "status" character varying(50) NOT NULL DEFAULT 'pending',
                "email" character varying(255),
                "phone" character varying(255),
                "user_id" uuid,
                "product_id" uuid,
                CONSTRAINT "PK_Booking" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying(500) NOT NULL,
                "description" text,
                "destination_id" uuid,
                "supplier_id" uuid,
                CONSTRAINT "PK_Product" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."video" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" character varying(500) NOT NULL,
                "url" character varying(500),
                "thumbnail" character varying,
                "description" text,
                "tag" character varying(255),
                "embedding" vector(384),
                "product_id" uuid,
                CONSTRAINT "PK_Video" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "Fk_Booking_User" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking"
            ADD CONSTRAINT "Fk_Booking_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD CONSTRAINT "FK_Product_Destination" FOREIGN KEY ("destination_id") REFERENCES "destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product"
            ADD CONSTRAINT "FK_Product_Supplier" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video"
            ADD CONSTRAINT "Fk_Video_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`ANALYZE "${schema}"."video";`);
    await queryRunner.query(`SET search_path TO public, "${schema}";`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_video_embedding_cosine" ON "${schema}"."video" USING hnsw (embedding vector_cosine_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}".idx_video_embedding_cosine;`,
    );

    await queryRunner.query(`
            ALTER TABLE "${schema}"."video" DROP CONSTRAINT "Fk_Video_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP CONSTRAINT "FK_Product_Supplier"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."product" DROP CONSTRAINT "FK_Product_Destination"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "Fk_Booking_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking" DROP CONSTRAINT "Fk_Booking_User"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."video"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."product"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."booking"
        `);

    await queryRunner.query(`
            DROP TABLE "${schema}"."user"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."supplier"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."destination"
        `);
  }
}
