import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class Searching1776417804377 implements MigrationInterface {
  name = 'Searching1776417804377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."idx_video_embedding_cosine"
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."searching_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "query" text NOT NULL,
                "user_id" uuid,
                "ip_address" character varying(50) NOT NULL,
                CONSTRAINT "PK_Searching_Log" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."searching_stat" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "query" text NOT NULL,
                "total_count" integer NOT NULL DEFAULT '1',
                "month_count" integer NOT NULL DEFAULT '1',
                "last_searched_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_SearchingStat_Query" UNIQUE ("query"),
                CONSTRAINT "PK_Searching_Stat" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "${schema}"."searching_stat"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."searching_log"
        `);
  }
}
