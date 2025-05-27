import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsedTokenEntity1747657637854 implements MigrationInterface {
    name = 'AddUsedTokenEntity1747657637854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`used_tokens\` (\`id\` varchar(36) NOT NULL, \`token\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`usedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_0e8726fdb2c5808e5e6d541833\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_0e8726fdb2c5808e5e6d541833\` ON \`used_tokens\``);
        await queryRunner.query(`DROP TABLE \`used_tokens\``);
    }

}
