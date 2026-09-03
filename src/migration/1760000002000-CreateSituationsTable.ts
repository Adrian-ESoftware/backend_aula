import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSituationsTable1760000002000 implements MigrationInterface {
  name = 'CreateSituationsTable1760000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('situations')) return;

    await queryRunner.createTable(new Table({
      name: 'situations',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'nameSituation', type: 'varchar', length: '80' },
        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('situations')) await queryRunner.dropTable('situations');
  }
}
