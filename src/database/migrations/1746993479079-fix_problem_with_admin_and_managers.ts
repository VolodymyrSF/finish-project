import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class FixProblemWithAdminAndManagers1746993479079 implements MigrationInterface {
    name = 'FixProblemWithAdminAndManagers1746993479079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('managers', new TableColumn({
            name: 'userId',
            type: 'varchar',
            isNullable: true,
        }));

        await queryRunner.createForeignKey('managers', new TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('managers');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('managers', foreignKey);
        }
        await queryRunner.dropColumn('managers', 'userId');
    }
}