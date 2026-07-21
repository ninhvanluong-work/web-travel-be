import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingPayment1784622478033 implements MigrationInterface {
  name = 'BookingPayment1784622478033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."booking_payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "provider" character varying(100),
                "provider_tx_id" character varying(255),
                "provider_intent_id" character varying(255),
                "price" numeric(12, 2) NOT NULL DEFAULT '0',
                "currency" character varying(10) DEFAULT 'VND',
                "status" character varying(50) NOT NULL DEFAULT 'pending',
                "failure_reason" text,
                "raw_response" jsonb,
                "booking_id" uuid,
                CONSTRAINT "PK_BookingPayment" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking_payment"
            ADD CONSTRAINT "Fk_BookingPayment_Booking" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking_payment" DROP CONSTRAINT "Fk_BookingPayment_Booking"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."booking_payment"
        `);
  }
}
