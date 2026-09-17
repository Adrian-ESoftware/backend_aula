import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import { Situation } from '../src/entity/Situation';

describe('SituationController - Testes Completos', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Limpar o registro 'Ativo' antes do teste, caso já exista
    const situationRepo = AppDataSource.getRepository(Situation);
    await situationRepo.delete({ nameSituation: 'Ativo' });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('1. GET /situations deve retornar status 200 com mensagem de funcionamento', async () => {
    const response = await request(app).get('/situations');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Rota de situações funcionando com sucesso!');
  });

  it('2. POST /situations (1º disparo) deve cadastrar "Ativo" com sucesso (status 201)', async () => {
    const response = await request(app)
      .post('/situations')
      .send({ nameSituation: 'Ativo' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Situação cadastrada com sucesso!');
    expect(response.body).toHaveProperty('situation');
    expect(response.body.situation.nameSituation).toBe('Ativo');
    expect(response.body.situation.id).toBeDefined();
  });

  it('3. POST /situations (2º disparo duplicado) deve ser bloqueado por restrição unique (status 500)', async () => {
    const response = await request(app)
      .post('/situations')
      .send({ nameSituation: 'Ativo' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    // Deve conter indicação de erro no banco (duplicate entry)
    expect(response.body.message).toMatch(/Duplicate entry|ER_DUP_ENTRY/i);
  });
});
