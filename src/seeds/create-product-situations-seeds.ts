import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ProductSituation } from '../entity/ProductSituation';

export class CreateProductSituationsSeeds {
  private dataSource: DataSource;

  constructor(dataSource: DataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(ProductSituation);
    const count = await repository.count();

    if (count === 0) {
      const defaultProductSituations = [
        repository.create({ name: 'Disponível' }),
        repository.create({ name: 'Indisponível' }),
        repository.create({ name: 'Esgotado' }),
        repository.create({ name: 'Descontinuado' }),
      ];

      await repository.save(defaultProductSituations);
      console.log('Situações de produto cadastradas com sucesso: Disponível, Indisponível, Esgotado, Descontinuado.');
    } else {
      console.log('Tabela product_situations já possui registros. Nenhuma seed foi inserida.');
    }
  }

  public async execute(): Promise<void> {
    return this.run();
  }
}

export { CreateProductSituationsSeeds as CreateProductSituationsSeed };
export default CreateProductSituationsSeeds;
