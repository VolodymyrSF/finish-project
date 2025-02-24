import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKeyForManagersInRefreshToken1740396175860 implements MigrationInterface {
    name = 'AddKeyForManagersInRefreshToken1740396175860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD \`manager_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_4a3d2a11e760de57a0cc674a281\` FOREIGN KEY (\`manager_id\`) REFERENCES \`managers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_4a3d2a11e760de57a0cc674a281\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP COLUMN \`manager_id\``);
    }

}
