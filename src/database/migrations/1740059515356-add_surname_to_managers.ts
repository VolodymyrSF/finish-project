import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSurnameToManagers1740059515356 implements MigrationInterface {
    name = 'AddSurnameToManagers1740059515356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`managers\` ADD \`surname\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`managers\` DROP COLUMN \`surname\``);
    }
}
