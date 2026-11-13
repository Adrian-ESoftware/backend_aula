import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('GET /test-connection', () => {
  it('retorna status 200, mensagem de sucesso e cabeçalho CORS', async () => {
    const response = await request(app)
      .get('/test-connection')
      .set('Origin', 'http://localhost:5173');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Conexão com a API realizada com sucesso!',
    });
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });
});
