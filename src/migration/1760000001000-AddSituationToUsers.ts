import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddSituationToUsers1760000001000 implements MigrationInterface {
  name = 'AddSituationToUsers1760000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const situations = await queryRunner.getTable('situations');
    if (situations?.findColumnByName('name') && !situations.findColumnByName('nameSituation')) {
      await queryRunner.renameColumn('situations', 'name', 'nameSituation');
    }
    const refreshedSituations = await queryRunner.getTable('situations');
    if (refreshedSituations && !refreshedSituations.findColumnByName('created_at')) {
      await queryRunner.addColumn('situations', new TableColumn({
        name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP',
      }));
    }
    if (refreshedSituations && !refreshedSituations.findColumnByName('updated_at')) {
      await queryRunner.addColumn('situations', new TableColumn({
        name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP',
      }));
    }

    const users = await queryRunner.getTable('users');
    if (!users?.findColumnByName('situation_id')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'situation_id', type: 'int', isNullable: true,
      }));
    }
    const refreshedUsers = await queryRunner.getTable('users');
    if (refreshedUsers && !refreshedUsers.foreignKeys.some((key) => key.columnNames.includes('situation_id'))) {
      await queryRunner.createForeignKey('users', new TableForeignKey({
        columnNames: ['situation_id'], referencedTableName: 'situations', referencedColumnNames: ['id'], onDelete: 'SET NULL',
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.getTable('users');
    const foreignKey = users?.foreignKeys.find((key) => key.columnNames.includes('situation_id'));
    if (foreignKey) await queryRunner.dropForeignKey('users', foreignKey);
    await queryRunner.dropColumn('users', 'situation_id');
  }
}
