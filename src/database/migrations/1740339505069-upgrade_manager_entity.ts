import { MigrationInterface, QueryRunner } from "typeorm";

export class UpgradeManagerEntity1740339505069 implements MigrationInterface {
    name = 'UpgradeManagerEntity1740339505069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`managers\` ADD \`password\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`managers\` ADD \`isActive\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`managers\` ADD \`isBanned\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`managers\` DROP COLUMN \`isBanned\``);
        await queryRunner.query(`ALTER TABLE \`managers\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`managers\` DROP COLUMN \`password\``);
    }
}
