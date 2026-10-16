import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { CreateSituationsSeeds } from './seeds/create-situations-seeds';

const run = async (): Promise<void> => {
  try {
    console.log('Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    console.log('Executando seeds...');
    const situationsSeed = new CreateSituationsSeeds(AppDataSource);
    await situationsSeed.execute();

    console.log('Seeds finalizadas com sucesso.');
  } catch (error) {
    console.error('Falha ao executar seeds:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexão com o banco de dados encerrada com segurança.');
    }
  }
};

run();
