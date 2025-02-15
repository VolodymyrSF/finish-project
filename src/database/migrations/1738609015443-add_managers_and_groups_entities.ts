import { MigrationInterface, QueryRunner } from "typeorm";

export class AddManagersAndGroupsEntities1738609015443 implements MigrationInterface {
    name = 'AddManagersAndGroupsEntities1738609015443'
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE \`managers\` (
                                      \`id\` varchar(36) NOT NULL,
                                      \`name\` varchar(255) NOT NULL,
                                      \`email\` varchar(255) NOT NULL,
                                      \`phone\` varchar(255) NULL,
                                      UNIQUE INDEX \`IDX_8d5fd9a2217bf7b16bef11fdf8\` (\`email\`),
                                      PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
    `);

    // Створення таблиці groups
    await queryRunner.query(`
        CREATE TABLE \`groups\` (
                                    \`id\` varchar(36) NOT NULL,
                                    \`name\` varchar(255) NOT NULL,
                                    \`description\` varchar(255) NULL,
                                    PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
    `);



    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`manager_id\` varchar(36) NULL`);
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`group_id\` varchar(36) NULL`);

    await queryRunner.query(`
      ALTER TABLE \`orders\` 
      ADD CONSTRAINT \`FK_orders_manager\` 
      FOREIGN KEY (\`manager_id\`) REFERENCES \`managers\`(\`id\`) 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`orders\` 
      ADD CONSTRAINT \`FK_orders_group\` 
      FOREIGN KEY (\`group_id\`) REFERENCES \`groups\`(\`id\`) 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_group\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_manager\``);

    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`group_id\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`manager_id\``);



    await queryRunner.query(`DROP TABLE \`groups\``);
    await queryRunner.query(`DROP INDEX \`IDX_8d5fd9a2217bf7b16bef11fdf8\` ON \`managers\``);
    await queryRunner.query(`DROP TABLE \`managers\``);
  }
}
