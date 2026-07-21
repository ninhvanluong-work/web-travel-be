import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class TourSession1784625455433 implements MigrationInterface {
  name = 'TourSession1784625455433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."tour_session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "option_id" uuid,
                "travel_date" TIMESTAMP WITH TIME ZONE,
                "departure_time" TIMESTAMP WITH TIME ZONE,
                "capacity" integer NOT NULL DEFAULT '0',
                "remaining_slot" integer NOT NULL DEFAULT '0',
                "unit_ref_id" uuid,
                "price" numeric(12, 2) NOT NULL DEFAULT '0',
                "status" character varying(50) NOT NULL DEFAULT 'inactive',
                CONSTRAINT "PK_TourSession" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session"
            ADD CONSTRAINT "FK_TourSession_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" DROP CONSTRAINT "FK_TourSession_Option"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."tour_session"
        `);
  }
}
