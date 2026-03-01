import { MigrationInterface, QueryRunner } from 'typeorm';

export class VideoLike1772336977824 implements MigrationInterface {
  name = 'VideoLike1772336977824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "video"
            ADD "like" integer NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "video" DROP COLUMN "like"
        `);
  }
}
