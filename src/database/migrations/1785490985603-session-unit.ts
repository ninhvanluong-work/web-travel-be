import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class SessionUnit1785490985603 implements MigrationInterface {
  name = 'SessionUnit1785490985603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "${schema}"."session_unit" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "session_id" uuid NOT NULL,
                "unit_id" uuid NOT NULL,
                "price" numeric(12, 2) NOT NULL DEFAULT '0',
                CONSTRAINT "PK_SessionUnit" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_SessionUnit_Session_Unit" UNIQUE ("session_id", "unit_id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session_unit"
            ADD CONSTRAINT "FK_SessionUnit_Session" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session_unit"
            ADD CONSTRAINT "FK_SessionUnit_Unit" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "${schema}"."session_unit"
        `);
  }
}
