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
    // Limpar os registros antes do teste, caso já existam
    const situationRepo = AppDataSource.getRepository(Situation);
    await situationRepo.delete({ nameSituation: 'Ativo' });
    await situationRepo.delete({ nameSituation: 'Inativo' });
    await situationRepo.delete({ nameSituation: 'Pendente' });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      const situationRepo = AppDataSource.getRepository(Situation);
      await situationRepo.delete({ nameSituation: 'Ativo' });
      await situationRepo.delete({ nameSituation: 'Inativo' });
      await situationRepo.delete({ nameSituation: 'Pendente' });
      await AppDataSource.destroy();
    }
  });

  it('1. GET /situations (list) deve retornar status 200 com array de situações', async () => {
    const response = await request(app).get('/situations');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
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

  it('4. GET /situations (list) deve conter a situação "Ativo" cadastrada', async () => {
    const response = await request(app).get('/situations');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const ativo = response.body.find((item: any) => item.nameSituation === 'Ativo');
    expect(ativo).toBeDefined();
    expect(ativo.id).toBeDefined();
  });

  it('5. GET /situations/:id (view) deve retornar status 200 com o objeto da situação específica', async () => {
    const situationRepo = AppDataSource.getRepository(Situation);
    const situation = await situationRepo.findOneBy({ nameSituation: 'Ativo' });
    expect(situation).toBeDefined();

    const response = await request(app).get(`/situations/${situation!.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(situation!.id);
    expect(response.body.nameSituation).toBe('Ativo');
  });

  it('6. GET /situations/:id (view) com ID inexistente deve retornar status 404 e mensagem de erro', async () => {
    const response = await request(app).get('/situations/999999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/Situação não encontrada/i);
  });

  it('7. PUT /situations/:id (edit) com ID válido deve atualizar a situação com sucesso (status 200)', async () => {
    const situationRepo = AppDataSource.getRepository(Situation);
    const situation = await situationRepo.findOneBy({ nameSituation: 'Ativo' });
    expect(situation).toBeDefined();

    const response = await request(app)
      .put(`/situations/${situation!.id}`)
      .send({ nameSituation: 'Inativo' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Situação atualizada com sucesso');
    expect(response.body).toHaveProperty('situation');
    expect(response.body.situation.id).toBe(situation!.id);
    expect(response.body.situation.nameSituation).toBe('Inativo');

    // Verificar persistência no banco de dados
    const updatedInDb = await situationRepo.findOneBy({ id: situation!.id });
    expect(updatedInDb).toBeDefined();
    expect(updatedInDb?.nameSituation).toBe('Inativo');
  });

  it('8. PUT /situations/:id (edit) com ID inexistente deve retornar status 404 e mensagem de erro', async () => {
    const response = await request(app)
      .put('/situations/999999')
      .send({ nameSituation: 'Qualquer' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/Situação não encontrada/i);
  });

  it('9. PUT /situations/:id (edit) com nome duplicado deve ser bloqueado por restrição unique (status 500)', async () => {
    // Cadastrar uma nova situação "Pendente"
    const createRes = await request(app)
      .post('/situations')
      .send({ nameSituation: 'Pendente' });
    expect(createRes.status).toBe(201);
    const pendenteId = createRes.body.situation.id;

    // Tentar atualizar "Pendente" para "Inativo" (já existente)
    const response = await request(app)
      .put(`/situations/${pendenteId}`)
      .send({ nameSituation: 'Inativo' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/Duplicate entry|ER_DUP_ENTRY/i);
  });

  it('10. PATCH /situations/:id (edit) também deve atualizar com sucesso (status 200)', async () => {
    const situationRepo = AppDataSource.getRepository(Situation);
    const situation = await situationRepo.findOneBy({ nameSituation: 'Inativo' });
    expect(situation).toBeDefined();

    const response = await request(app)
      .patch(`/situations/${situation!.id}`)
      .send({ nameSituation: 'Ativo' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Situação atualizada com sucesso');
    expect(response.body.situation.nameSituation).toBe('Ativo');
  });
});
