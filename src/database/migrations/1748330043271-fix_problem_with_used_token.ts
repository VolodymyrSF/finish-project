import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProblemWithUsedToken1748330043271 implements MigrationInterface {
    name = 'FixProblemWithUsedToken1748330043271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`used_tokens\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`used_tokens\` ADD \`token\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`used_tokens\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`used_tokens\` ADD \`token\` varchar(255) NOT NULL`);

    }
}
