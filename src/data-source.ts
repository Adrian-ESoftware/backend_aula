import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './config';
import { Product } from './entity/Product';
import { Situation, Situations } from './entity/Situations';
import { User, Users } from './entity/Users';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  entities: [User, Situation, Product],
  migrations: [__dirname + '/migration/*.{js,ts}'],
  synchronize: false,
  logging: config.nodeEnv === 'development' ? ['error'] : false,
});
