import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTokenEntityX21737915337690 implements MigrationInterface {
    name = 'FixTokenEntityX21737915337690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP COLUMN \`deviceId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD \`deviceId\` text NOT NULL`);
    }

}
