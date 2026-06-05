import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UpdateTourGuideFields1780500000000 implements MigrationInterface {
  name = 'UpdateTourGuideFields1780500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ADD "description" text
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tour_guide"
            ALTER COLUMN "user_review"
            SET DEFAULT '{"reviewCount":0,"reviewValue":0,"ratings":[{"key":"storytelling","name":"Storytelling","value":0},{"key":"localKnowledge","name":"Local knowledge","value":0},{"key":"careAttention","name":"Care & attention","value":0},{"key":"safetyAwareness","name":"Safety awareness","value":0},{"key":"punctuality","name":"Punctuality","value":0},{"key":"english","name":"English","value":0},{"key":"funny","name":"funny","value":0}]}'
        `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."tour_guide"
      ADD "experts" character varying(100)[] DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${schema}"."tour_guide"
      DROP COLUMN "experts"
    `);

    await queryRunner.query(`
        ALTER TABLE "${schema}"."tour_guide" DROP COLUMN "description"
    `);
  }
}
