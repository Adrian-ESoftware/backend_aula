import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateProductCategoriesAndSituations1760000004000 implements MigrationInterface {
  name = 'CreateProductCategoriesAndSituations1760000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabela product_categories
    if (!(await queryRunner.hasTable('product_categories'))) {
      await queryRunner.createTable(
        new Table({
          name: 'product_categories',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );
    }

    // 2. Tabela product_situations
    if (!(await queryRunner.hasTable('product_situations'))) {
      await queryRunner.createTable(
        new Table({
          name: 'product_situations',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '255',
              isUnique: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );
    }

    // 3. Tabela products
    if (!(await queryRunner.hasTable('products'))) {
      await queryRunner.createTable(
        new Table({
          name: 'products',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'productSituationId',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'productCategoryId',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );
    } else {
      const table = await queryRunner.getTable('products');
      if (table) {
        // Remover chave estrangeira legada de situation_id se existir
        const legacyFk = table.foreignKeys.find((fk) => fk.columnNames.includes('situation_id'));
        if (legacyFk) {
          await queryRunner.dropForeignKey('products', legacyFk);
        }

        // Tornar colunas legadas opcionais (NULL) para suportar o novo diagrama
        if (table.findColumnByName('situation_id')) {
          await queryRunner.changeColumn(
            'products',
            'situation_id',
            new TableColumn({
              name: 'situation_id',
              type: 'int',
              isNullable: true,
            }),
          );
        }
        if (table.findColumnByName('price')) {
          await queryRunner.changeColumn(
            'products',
            'price',
            new TableColumn({
              name: 'price',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            }),
          );
        }
        if (table.findColumnByName('slug')) {
          await queryRunner.changeColumn(
            'products',
            'slug',
            new TableColumn({
              name: 'slug',
              type: 'varchar',
              length: '180',
              isNullable: true,
            }),
          );
        }

        if (!table.findColumnByName('productSituationId')) {
          await queryRunner.addColumn(
            'products',
            new TableColumn({
              name: 'productSituationId',
              type: 'int',
              isNullable: true,
            }),
          );
        }
        if (!table.findColumnByName('productCategoryId')) {
          await queryRunner.addColumn(
            'products',
            new TableColumn({
              name: 'productCategoryId',
              type: 'int',
              isNullable: true,
            }),
          );
        }
        if (!table.findColumnByName('createdAt') && !table.findColumnByName('created_at')) {
          await queryRunner.addColumn(
            'products',
            new TableColumn({
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            }),
          );
        }
        if (!table.findColumnByName('updatedAt') && !table.findColumnByName('updated_at')) {
          await queryRunner.addColumn(
            'products',
            new TableColumn({
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            }),
          );
        }
      }
    }

    // Criar Foreign Keys em products
    const productsTable = await queryRunner.getTable('products');
    if (productsTable) {
      const hasSituationFk = productsTable.foreignKeys.some((fk) =>
        fk.columnNames.includes('productSituationId'),
      );
      if (!hasSituationFk && productsTable.findColumnByName('productSituationId')) {
        await queryRunner.createForeignKey(
          'products',
          new TableForeignKey({
            columnNames: ['productSituationId'],
            referencedTableName: 'product_situations',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        );
      }

      const hasCategoryFk = productsTable.foreignKeys.some((fk) =>
        fk.columnNames.includes('productCategoryId'),
      );
      if (!hasCategoryFk && productsTable.findColumnByName('productCategoryId')) {
        await queryRunner.createForeignKey(
          'products',
          new TableForeignKey({
            columnNames: ['productCategoryId'],
            referencedTableName: 'product_categories',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const productsTable = await queryRunner.getTable('products');
    if (productsTable) {
      const fkSituation = productsTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('productSituationId'),
      );
      if (fkSituation) await queryRunner.dropForeignKey('products', fkSituation);

      const fkCategory = productsTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('productCategoryId'),
      );
      if (fkCategory) await queryRunner.dropForeignKey('products', fkCategory);
    }

    if (await queryRunner.hasTable('product_categories')) {
      await queryRunner.dropTable('product_categories', true);
    }

    if (await queryRunner.hasTable('product_situations')) {
      await queryRunner.dropTable('product_situations', true);
    }
  }
}
