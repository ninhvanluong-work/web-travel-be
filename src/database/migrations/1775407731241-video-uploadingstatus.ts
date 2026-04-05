import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const schema = process.env.POSTGRES_SCHEMA || 'public';

export class VideoUploadingStatus1775407731241 implements MigrationInterface {
  name = 'VideoUploadingStatus1775407731241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video"
            ADD "guid" character varying(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video"
            ADD "uploading_status" integer
        `);
    await queryRunner.query(`
          ALTER TABLE  "${schema}"."video"
          ADD CONSTRAINT "UQ_VideoGuid" UNIQUE ("guid")
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE  "${schema}"."video" DROP CONSTRAINT "UQ_VideoGuid"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video" DROP COLUMN "uploading_status"
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."video" DROP COLUMN "guid"
        `);
  }
}
