import 'reflect-metadata';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import { Product } from '../src/entity/Product';
import { ProductCategory } from '../src/entity/ProductCategory';
import { ProductSituation } from '../src/entity/ProductSituation';

describe('Fluxo Completo - Categories, Situations e Products', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const productRepo = AppDataSource.getRepository(Product);
    const categoryRepo = AppDataSource.getRepository(ProductCategory);
    const situationRepo = AppDataSource.getRepository(ProductSituation);

    await productRepo.delete({ name: 'Placa de Vídeo RTX Test' });
    await categoryRepo.delete({ name: 'Hardware de Teste' });
    await situationRepo.delete({ name: 'Em Pré-Venda' });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      const productRepo = AppDataSource.getRepository(Product);
      const categoryRepo = AppDataSource.getRepository(ProductCategory);
      const situationRepo = AppDataSource.getRepository(ProductSituation);

      await productRepo.delete({ name: 'Placa de Vídeo RTX Test' });
      await categoryRepo.delete({ name: 'Hardware de Teste' });
      await situationRepo.delete({ name: 'Em Pré-Venda' });
      await AppDataSource.destroy();
    }
  });

  it('1. Deve listar categorias paginadas', async () => {
    const res = await request(app).get('/product-categories?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('totalRecords');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('2. Deve cadastrar uma nova categoria de produto', async () => {
    const res = await request(app)
      .post('/product-categories')
      .send({ name: 'Hardware de Teste' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('productCategory');
    expect(res.body.productCategory.name).toBe('Hardware de Teste');
  });

  it('3. Deve cadastrar uma nova situação de produto', async () => {
    const res = await request(app)
      .post('/product-situations')
      .send({ name: 'Em Pré-Venda' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('productSituation');
    expect(res.body.productSituation.name).toBe('Em Pré-Venda');
  });

  it('4. Deve cadastrar um produto associado à categoria e situação criadas', async () => {
    const categoryRepo = AppDataSource.getRepository(ProductCategory);
    const situationRepo = AppDataSource.getRepository(ProductSituation);

    const category = await categoryRepo.findOneBy({ name: 'Hardware de Teste' });
    const situation = await situationRepo.findOneBy({ name: 'Em Pré-Venda' });

    expect(category).toBeDefined();
    expect(situation).toBeDefined();

    const res = await request(app)
      .post('/products')
      .send({
        name: 'Placa de Vídeo RTX Test',
        productCategoryId: category!.id,
        productSituationId: situation!.id,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('product');
    expect(res.body.product.name).toBe('Placa de Vídeo RTX Test');
    expect(res.body.product.productCategoryId).toBe(category!.id);
    expect(res.body.product.productSituationId).toBe(situation!.id);
  });

  it('5. Deve listar produtos paginados com relacionamentos', async () => {
    const res = await request(app).get('/products?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    const createdProduct = res.body.data.find(
      (p: any) => p.name === 'Placa de Vídeo RTX Test',
    );
    expect(createdProduct).toBeDefined();
    expect(createdProduct.productCategory).toBeDefined();
    expect(createdProduct.productSituation).toBeDefined();
    expect(createdProduct.productCategory.name).toBe('Hardware de Teste');
    expect(createdProduct.productSituation.name).toBe('Em Pré-Venda');
  });
});
