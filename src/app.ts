import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { AppError } from './errors';
import { AuthController } from './controllers/AuthController';
import { SituationsController } from './controllers/SituationsController';
import catalogRoutes from './routes/catalog.routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', AuthController);
app.use(SituationsController);
app.use(catalogRoutes);

app.use((_req, _res, next) => next(new AppError('Rota não encontrada.', 404)));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message, ...(error.details ? { details: error.details } : {}) });
    return;
  }
  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});
