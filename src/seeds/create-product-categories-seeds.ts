import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ProductCategory } from '../entity/ProductCategory';

export class CreateProductCategoriesSeeds {
  private dataSource: DataSource;

  constructor(dataSource: DataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(ProductCategory);
    const count = await repository.count();

    if (count === 0) {
      const defaultCategories = [
        repository.create({ name: 'Eletrônicos' }),
        repository.create({ name: 'Informática' }),
        repository.create({ name: 'Acessórios' }),
        repository.create({ name: 'Escritório' }),
      ];

      await repository.save(defaultCategories);
      console.log('Categorias de produto cadastradas com sucesso: Eletrônicos, Informática, Acessórios, Escritório.');
    } else {
      console.log('Tabela product_categories já possui registros. Nenhuma seed foi inserida.');
    }
  }

  public async execute(): Promise<void> {
    return this.run();
  }
}

export { CreateProductCategoriesSeeds as CreateProductCategoriesSeed };
export default CreateProductCategoriesSeeds;
