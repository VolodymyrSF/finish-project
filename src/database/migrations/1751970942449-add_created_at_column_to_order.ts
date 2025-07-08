import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtColumnToOrder1751970942449 implements MigrationInterface {
    name = 'AddCreatedAtColumnToOrder1751970942449'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE \`orders\`
      ADD \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE \`orders\` DROP COLUMN \`updated_at\`
    `);
    }
}