import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class SupplierPaymentDetails1786956022871 implements MigrationInterface {
  name = 'SupplierPaymentDetails1786956022871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "details" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "is_default" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."supplier_payment"
            SET "details" = jsonb_strip_nulls(
                jsonb_build_object(
                    'bankName', "bank",
                    'accountHolder', "account_holder",
                    'accountNumber', "account_number",
                    'swiftCode', "swift_code"
                )
            )
            WHERE "method" = 'bank'
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."supplier_payment"
            SET "details" = jsonb_strip_nulls(
                jsonb_build_object(
                    'email', "paypal_email"
                )
            )
            WHERE "method" = 'paypal'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "bank"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "account_holder"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "account_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "swift_code"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "branch_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "paypal_email"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "tax_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "bank" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "account_holder" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "account_number" character varying(100)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "swift_code" character varying(50)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "branch_address" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "paypal_email" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment"
            ADD "tax_id" character varying(100)
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."supplier_payment"
            SET "bank" = "details"->>'bankName',
                "account_holder" = "details"->>'accountHolder',
                "account_number" = "details"->>'accountNumber',
                "swift_code" = "details"->>'swiftCode'
            WHERE "method" = 'bank'
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."supplier_payment"
            SET "paypal_email" = "details"->>'email'
            WHERE "method" = 'paypal'
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "is_default"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."supplier_payment" DROP COLUMN "details"
        `);
  }
}
