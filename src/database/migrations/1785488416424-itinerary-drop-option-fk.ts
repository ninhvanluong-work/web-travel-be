import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class ItineraryDropOptionFk1785488416424 implements MigrationInterface {
  name = 'ItineraryDropOptionFk1785488416424';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary" DROP CONSTRAINT "FK_Itinerary_Option"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary" DROP COLUMN "option_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary" ADD COLUMN "option_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."itinerary"
            ADD CONSTRAINT "FK_Itinerary_Option" FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
