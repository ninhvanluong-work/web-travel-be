import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class DepartureTime1784796019297 implements MigrationInterface {
  name = 'DepartureTime1784796019297';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."departure_time" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "option_id" uuid NOT NULL,
                "time" TIME NOT NULL,
                "label" character varying(255),
                "order" integer NOT NULL DEFAULT '0',
                "is_active" boolean NOT NULL DEFAULT true,
                "note" text,
                CONSTRAINT "PK_DepartureTime" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time"
            ADD CONSTRAINT "FK_DepartureTime_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."departure_time" DROP CONSTRAINT "FK_DepartureTime_Option"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."departure_time"
        `);
  }
}
