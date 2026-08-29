import 'dotenv/config';

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  database: {
    host: required('DB_HOST', 'localhost'),
    port: Number(process.env.DB_PORT ?? 3306),
    username: required('DB_USERNAME', 'root'),
    password: process.env.DB_PASSWORD ?? '',
    database: required('DB_DATABASE', 'nodeapi'),
  },
  jwtSecret: required(
    'JWT_SECRET',
    process.env.NODE_ENV === 'production' ? undefined : 'change-this-development-secret',
  ),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  recoveryTokenExpiresMinutes: Number(process.env.RECOVERY_TOKEN_EXPIRES_MINUTES ?? 30),
};
