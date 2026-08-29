import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import * as yup from 'yup';
import { AppDataSource } from '../data-source';
import { config } from '../config';
import { AppError } from '../errors';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, createRecoveryToken, hashRecoveryToken, validateBody } from '../utils';
import { User } from '../entities/User';

const router = Router();
const users = (): ReturnType<typeof AppDataSource.getRepository<User>> =>
  AppDataSource.getRepository(User);

const registerSchema = yup.object({
  name: yup.string().trim().min(2).max(120).required(),
  email: yup.string().trim().lowercase().email().max(180).required(),
  password: yup.string().min(8).max(100).required(),
});

const loginSchema = yup.object({
  email: yup.string().trim().lowercase().email().required(),
  password: yup.string().required(),
});

const forgotSchema = yup.object({
  email: yup.string().trim().lowercase().email().required(),
});

const resetSchema = yup.object({
  token: yup.string().length(64).required(),
  newPassword: yup.string().min(8).max(100).required(),
});

const publicUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (user: User): string =>
  jwt.sign({ userId: user.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  });

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = await validateBody(registerSchema, req.body);
    const email = input.email.toLowerCase();
    const repository = users();
    if (await repository.findOne({ where: { email } })) {
      throw new AppError('Já existe um usuário com este e-mail.', 409);
    }

    const user = repository.create({
      name: input.name,
      email,
      password: await bcrypt.hash(input.password, 10),
      recoveryTokenHash: null,
      recoveryTokenExpiresAt: null,
    });
    await repository.save(user);
    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = await validateBody(loginSchema, req.body);
    const user = await users().findOne({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }
    res.json({ user: publicUser(user), token: signToken(user) });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await users().findOneBy({ id: req.userId });
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    res.json({ user: publicUser(user) });
  }),
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const input = await validateBody(forgotSchema, req.body);
    const user = await users().findOne({ where: { email: input.email.toLowerCase() } });
    const response: { message: string; resetToken?: string; resetUrl?: string } = {
      message: 'Se o e-mail estiver cadastrado, as instruções de recuperação foram geradas.',
    };

    if (!user) {
      res.json(response);
      return;
    }

    const token = createRecoveryToken();
    user.recoveryTokenHash = hashRecoveryToken(token);
    user.recoveryTokenExpiresAt = new Date(
      Date.now() + config.recoveryTokenExpiresMinutes * 60 * 1000,
    );
    await users().save(user);

    if (config.nodeEnv !== 'production') {
      response.resetToken = token;
      response.resetUrl = `/auth/reset-password?token=${token}`;
    }
    res.json(response);
  }),
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const input = await validateBody(resetSchema, req.body);
    const user = await users().findOne({
      where: { recoveryTokenHash: hashRecoveryToken(input.token) },
    });
    if (!user || !user.recoveryTokenExpiresAt || user.recoveryTokenExpiresAt <= new Date()) {
      throw new AppError('Token de recuperação inválido ou expirado.', 400);
    }

    user.password = await bcrypt.hash(input.newPassword, 10);
    user.recoveryTokenHash = null;
    user.recoveryTokenExpiresAt = null;
    await users().save(user);
    res.json({ message: 'Senha redefinida com sucesso.' });
  }),
);

export default router;
