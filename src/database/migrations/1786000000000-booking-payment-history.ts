import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class BookingPaymentHistory1786000000000 implements MigrationInterface {
  name = 'BookingPaymentHistory1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."booking_payment_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "booking_payment_id" uuid NOT NULL,
                "booking_id" uuid,
                "from_status" character varying(50),
                "to_status" character varying(50) NOT NULL,
                "provider" character varying(100),
                "provider_tx_id" character varying(255),
                "reason" text,
                "raw_response" jsonb,
                "source" character varying(50),
                CONSTRAINT "PK_BookingPaymentHistory" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking_payment_history"
            ADD CONSTRAINT "Fk_BookingPaymentHistory_BookingPayment" FOREIGN KEY ("booking_payment_id") REFERENCES "booking_payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking_payment_history"
            ADD CONSTRAINT "Fk_BookingPaymentHistory_Booking" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            CREATE INDEX "Idx_BookingPaymentHistory_BookingPaymentId" ON "${schema}"."booking_payment_history" ("booking_payment_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "${schema}"."Idx_BookingPaymentHistory_BookingPaymentId"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking_payment_history" DROP CONSTRAINT "Fk_BookingPaymentHistory_Booking"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."booking_payment_history" DROP CONSTRAINT "Fk_BookingPaymentHistory_BookingPayment"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."booking_payment_history"
        `);
  }
}
