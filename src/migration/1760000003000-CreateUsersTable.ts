import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUsersTable1760000003000 implements MigrationInterface {
  name = 'CreateUsersTable1760000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('users')) return;

    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '120' },
        { name: 'email', type: 'varchar', length: '180', isUnique: true },
        { name: 'password', type: 'varchar', length: '255' },
        { name: 'recovery_token_hash', type: 'varchar', length: '64', isNullable: true },
        { name: 'recovery_token_expires_at', type: 'datetime', isNullable: true },
        { name: 'situation_id', type: 'int', isNullable: true },
        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createForeignKey('users', new TableForeignKey({
      columnNames: ['situation_id'],
      referencedTableName: 'situations',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.getTable('users');
    const foreignKey = users?.foreignKeys.find((key) => key.columnNames.includes('situation_id'));
    if (foreignKey) await queryRunner.dropForeignKey('users', foreignKey);
    if (await queryRunner.hasTable('users')) await queryRunner.dropTable('users');
  }
}
