import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class UserAuth1782059990030 implements MigrationInterface {
  name = 'UserAuth1782059990030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD "password" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD "refresh_token" character varying(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD "tour_guide_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD CONSTRAINT "UQ_USER_TOUR_GUIDE_ID" UNIQUE ("tour_guide_id")
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."user"
            ADD CONSTRAINT "FK_User_Tour_Guide" FOREIGN KEY ("tour_guide_id") REFERENCES "tour_guide"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP CONSTRAINT "FK_User_Tour_Guide"
        `);

    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP CONSTRAINT "UQ_USER_TOUR_GUIDE_ID"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP COLUMN "tour_guide_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP COLUMN "refresh_token"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."user" DROP COLUMN "password"
        `);
  }
}
