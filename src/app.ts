import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { AppError } from './errors';
import { AuthController } from './controllers/AuthController';
import { SituationController } from './controllers/SituationController';
import { ProductCategoryController } from './controllers/ProductCategoryController';
import { ProductSituationController } from './controllers/ProductSituationController';
import { ProductController } from './controllers/ProductController';
import { TestConnectionController } from './controllers/TestConnectionController';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/test-connection', TestConnectionController);

app.use('/auth', AuthController);
app.use('/situations', SituationController);
app.use('/product-categories', ProductCategoryController);
app.use('/product-situations', ProductSituationController);
app.use('/products', ProductController);

app.use((_req, _res, next) => next(new AppError('Rota não encontrada.', 404)));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message, ...(error.details ? { details: error.details } : {}) });
    return;
  }
  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});
