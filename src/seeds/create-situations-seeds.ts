import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Situation } from '../entity/Situation';

export class CreateSituationsSeeds {
  private dataSource: DataSource;

  constructor(dataSource: DataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  public async run(): Promise<void> {
    const situationRepository = this.dataSource.getRepository(Situation);
    const count = await situationRepository.count();

    if (count === 0) {
      const defaultSituations = [
        situationRepository.create({ nameSituation: 'Ativo' }),
        situationRepository.create({ nameSituation: 'Inativo' }),
        situationRepository.create({ nameSituation: 'Pendente' }),
      ];

      await situationRepository.save(defaultSituations);
      console.log('Situações cadastradas com sucesso: Ativo, Inativo, Pendente.');
    } else {
      console.log('Tabela situations já possui registros. Nenhuma seed foi inserida.');
    }
  }

  public async execute(): Promise<void> {
    return this.run();
  }
}

export { CreateSituationsSeeds as CreateSituationsSeed };
export default CreateSituationsSeeds;
