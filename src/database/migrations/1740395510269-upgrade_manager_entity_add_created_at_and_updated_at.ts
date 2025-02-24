import { MigrationInterface, QueryRunner } from "typeorm";

export class UpgradeManagerEntityAddCreatedAtAndUpdatedAt1740395510269 implements MigrationInterface {
    name = 'UpgradeManagerEntityAddCreatedAtAndUpdatedAt1740395510269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`managers\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`managers\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`managers\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`managers\` DROP COLUMN \`created_at\``);
    }

}
