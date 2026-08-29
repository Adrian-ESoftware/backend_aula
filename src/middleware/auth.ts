import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../errors';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError('Token de autenticação não informado.', 401));
    return;
  }

  try {
    const payload = jwt.verify(authorization.slice(7), config.jwtSecret);
    if (typeof payload === 'string' || typeof payload.userId !== 'number') {
      throw new Error('Payload inválido');
    }
    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError('Token de autenticação inválido ou expirado.', 401));
  }
};
