import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSituationsTable1760000002000 implements MigrationInterface {
  name = 'CreateSituationsTable1760000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('situations')) {
      const table = await queryRunner.getTable('situations');
      const hasUnique =
        table?.indices.some((idx) => idx.columnNames.includes('nameSituation')) ||
        table?.uniques.some((u) => u.columnNames.includes('nameSituation'));
      if (!hasUnique) {
        try {
          await queryRunner.query(
            'ALTER TABLE `situations` ADD UNIQUE `UQ_situations_nameSituation` (`nameSituation`)',
          );
        } catch {
          // Já único ou restrição existente
        }
      }
      return;
    }

    await queryRunner.createTable(new Table({
      name: 'situations',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'nameSituation', type: 'varchar', length: '80', isUnique: true },
        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('situations')) await queryRunner.dropTable('situations');
  }
}
