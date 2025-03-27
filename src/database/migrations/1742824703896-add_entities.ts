import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntities1742824703896 implements MigrationInterface {
    name = 'AddEntities1742824703896'
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Таблиця roles
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` enum('admin','manager') NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

        // 2. Таблиця managers
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`managers\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`surname\` varchar(255) NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(255) NULL,
        \`password\` varchar(255) NULL,
        \`isActive\` boolean NOT NULL DEFAULT false,
        \`isBanned\` boolean NOT NULL DEFAULT false,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_managers_email\` (\`email\`)
      ) ENGINE=InnoDB;
    `);

        // 3. Таблиця groups
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`groups\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` varchar(255) NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

        // 4. Таблиця users
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`roleId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_users_email\` (\`email\`),
        CONSTRAINT \`FK_users_role\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
      ) ENGINE=InnoDB;
    `);

        // 5. Таблиця orders
        if (!(await queryRunner.hasColumn('orders', 'comments'))) {
            await queryRunner.query(`
                ALTER TABLE \`orders\`
                    ADD COLUMN \`comments\` json NULL;
            `);
        }

        if (!(await queryRunner.hasColumn('orders', 'manager_id'))) {
            await queryRunner.query(`
      ALTER TABLE \`orders\`
      ADD COLUMN \`manager_id\` varchar(36) NULL;
    `);
        }

        if (!(await queryRunner.hasColumn('orders', 'group_id'))) {
            await queryRunner.query(`
        ALTER TABLE \`orders\`
        ADD COLUMN \`group_id\` varchar(36) NULL;
    `);

        }


        // 6. Таблиця refresh_tokens
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`refresh_tokens\` (
        \`id\` varchar(36) NOT NULL,
        \`refreshToken\` text NOT NULL,
        \`user_id\` varchar(36) NULL,
        \`manager_id\` varchar(36) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_refresh_tokens_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_refresh_tokens_manager\` FOREIGN KEY (\`manager_id\`) REFERENCES \`managers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`refresh_tokens\`;`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_manager\`;`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_group\`;`);
        await queryRunner.query(`DROP TABLE IF EXISTS \`users\`;`);
        await queryRunner.query(`DROP TABLE IF EXISTS \`groups\`;`);
        await queryRunner.query(`DROP TABLE IF EXISTS \`managers\`;`);
        await queryRunner.query(`DROP TABLE IF EXISTS \`roles\`;`);
    }

}
