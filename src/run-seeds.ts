import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { CreateSituationsSeeds } from './seeds/create-situations-seeds';
import { CreateProductSituationsSeeds } from './seeds/create-product-situations-seeds';
import { CreateProductCategoriesSeeds } from './seeds/create-product-categories-seeds';

const run = async (): Promise<void> => {
  try {
    console.log('Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    console.log('Executando seeds de situações de usuários...');
    const situationsSeed = new CreateSituationsSeeds(AppDataSource);
    await situationsSeed.execute();

    console.log('Executando seeds de situações de produtos...');
    const productSituationsSeed = new CreateProductSituationsSeeds(AppDataSource);
    await productSituationsSeed.execute();

    console.log('Executando seeds de categorias de produtos...');
    const productCategoriesSeed = new CreateProductCategoriesSeeds(AppDataSource);
    await productCategoriesSeed.execute();

    console.log('Todas as seeds foram finalizadas com sucesso.');
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
