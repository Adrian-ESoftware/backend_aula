import { createHash, randomBytes } from 'node:crypto';
import { RequestHandler } from 'express';
import { AnyObject, ObjectSchema, ValidationError } from 'yup';
import { AppError } from './errors';

export const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const validateBody = async <T extends AnyObject>(
  schema: ObjectSchema<T>,
  value: unknown,
): Promise<T> => {
  try {
    return (await schema.validate(value, { abortEarly: false, stripUnknown: true })) as T;
  } catch (error) {
    if (error instanceof ValidationError) {
      const details: Record<string, string> = {};
      for (const issue of error.inner.length ? error.inner : [error]) {
        if (issue.path && !details[issue.path]) details[issue.path] = issue.message;
      }
      throw new AppError('Dados inválidos.', 422, details);
    }
    throw error;
  }
};

export const parseId = (value: string | string[]): number => {
  if (Array.isArray(value)) throw new AppError('Identificador inválido.', 400);
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new AppError('Identificador inválido.', 400);
  return id;
};

export const createRecoveryToken = (): string => randomBytes(32).toString('hex');

export const hashRecoveryToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
