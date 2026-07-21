import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class SupplierPayment1784623147711 implements MigrationInterface {
  name = 'SupplierPayment1784623147711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."supplier_payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "method" character varying(50) NOT NULL DEFAULT 'bank',
                "bank" character varying(255),
                "account_holder" character varying(255),
                "account_number" character varying(100),
                "swift_code" character varying(50),
                "branch_address" character varying(500),
                "paypal_email" character varying(255),
                "currency" character varying(10) DEFAULT 'VND',
                "tax_id" character varying(100),
                "supplier_id" uuid,
                CONSTRAINT "PK_SupplierPayment" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD CONSTRAINT "Fk_SupplierPayment_Supplier" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP CONSTRAINT "Fk_SupplierPayment_Supplier"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."supplier_payment"
        `);
  }
}
