import 'reflect-metadata';
import { app } from './app';
import { config } from './config';
import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`API disponível em http://localhost:${config.port}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Não foi possível conectar ao banco de dados.', error);
    process.exitCode = 1;
  });
