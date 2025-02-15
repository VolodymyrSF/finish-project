import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentsAndMessage1738617001443 implements MigrationInterface {
    name = 'AddCommentsAndMessage1738617001443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`message\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`comments\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`utm\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`utm\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`comments\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`message\``);
    }
}
