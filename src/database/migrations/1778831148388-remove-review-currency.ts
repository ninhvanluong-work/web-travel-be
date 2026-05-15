import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class RemoveReviewCurrency1778831148388 implements MigrationInterface {
  name = 'RemoveReviewCurrency1778831148388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."review" DROP COLUMN "currency"
        `);
  }

  public async down(): Promise<void> {}
}
