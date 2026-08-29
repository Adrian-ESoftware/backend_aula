import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInitialTables1760000000000 implements MigrationInterface {
  name = 'CreateInitialTables1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'situations',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '80', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'tinyint', default: 1 },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'email', type: 'varchar', length: '180', isUnique: true },
          { name: 'password', type: 'varchar', length: '255' },
          { name: 'recovery_token_hash', type: 'varchar', length: '64', isNullable: true },
          { name: 'recovery_token_expires_at', type: 'datetime', isNullable: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '150' },
          { name: 'slug', type: 'varchar', length: '180', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'situation_id', type: 'int' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['situation_id'],
        referencedTableName: 'situations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const products = await queryRunner.getTable('products');
    const foreignKey = products?.foreignKeys.find((key) => key.columnNames.includes('situation_id'));
    if (foreignKey) await queryRunner.dropForeignKey('products', foreignKey);
    await queryRunner.dropTable('products', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('situations', true);
  }
}
