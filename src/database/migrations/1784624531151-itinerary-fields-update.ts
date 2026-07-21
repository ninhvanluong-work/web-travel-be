import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ItineraryFieldsUpdate1784624531151 implements MigrationInterface {
  name = 'ItineraryFieldsUpdate1784624531151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary"
            ADD "option_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary"
            ADD "is_default" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary"
            ADD CONSTRAINT "FK_Itinerary_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary" DROP CONSTRAINT "FK_Itinerary_Option"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary" DROP COLUMN "is_default"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary" DROP COLUMN "option_id"
        `);
  }
}
