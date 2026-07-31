import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class TourSessionRenameToSession1785490437145 implements MigrationInterface {
  name = 'TourSessionRenameToSession1785490437145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_session" RENAME TO "session"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" ADD COLUMN "product_id" uuid
        `);
    await queryRunner.query(`
            UPDATE "${schema}"."session" s
            SET "product_id" = o."product_id"
            FROM "${schema}"."option" o
            WHERE o."id" = s."option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" DROP CONSTRAINT "FK_TourSession_Option"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" DROP COLUMN "option_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session"
            ADD CONSTRAINT "FK_Session_Product" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" RENAME COLUMN "remaining_slot" TO "capacity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" RENAME COLUMN "capacity" TO "remaining_slot"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" DROP CONSTRAINT "FK_Session_Product"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" ADD COLUMN "option_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session"
            ADD CONSTRAINT "FK_TourSession_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" DROP COLUMN "product_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."session" RENAME TO "tour_session"
        `);
  }
}
