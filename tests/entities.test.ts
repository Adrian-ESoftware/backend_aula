import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';
import { Situations } from '../src/entity/Situations';
import { Users } from '../src/entity/Users';
import { Product } from '../src/entity/Product';
import { ProductCategory } from '../src/entity/ProductCategory';
import { ProductSituation } from '../src/entity/ProductSituation';

describe('entidades TypeORM', () => {
  it('configura o relacionamento entre situações e usuários', () => {
    const relations = getMetadataArgsStorage().relations;
    const situationUsers = relations.find(
      (relation) => relation.target === Situations && relation.propertyName === 'users',
    );
    const userSituation = relations.find(
      (relation) => relation.target === Users && relation.propertyName === 'situation',
    );
    const joinColumn = getMetadataArgsStorage().joinColumns.find(
      (column) => column.target === Users && column.propertyName === 'situation',
    );

    expect(situationUsers?.relationType).toBe('one-to-many');
    expect(userSituation?.relationType).toBe('many-to-one');
    expect(joinColumn?.name).toBe('situation_id');
  });

  it('mantém o e-mail único em Users', () => {
    const email = getMetadataArgsStorage().columns.find(
      (column) => column.target === Users && column.propertyName === 'email',
    );
    expect(email?.options.unique).toBe(true);
  });

  it('mantém o nameSituation único na entidade Situation', () => {
    const nameSituation = getMetadataArgsStorage().columns.find(
      (column) => column.target === Situations && column.propertyName === 'nameSituation',
    );
    expect(nameSituation?.options.unique).toBe(true);
  });

  it('configura o relacionamento entre ProductCategory e Product', () => {
    const relations = getMetadataArgsStorage().relations;
    const categoryProducts = relations.find(
      (relation) => relation.target === ProductCategory && relation.propertyName === 'products',
    );
    const productCategory = relations.find(
      (relation) => relation.target === Product && relation.propertyName === 'productCategory',
    );
    const joinColumn = getMetadataArgsStorage().joinColumns.find(
      (column) => column.target === Product && column.propertyName === 'productCategory',
    );

    expect(categoryProducts?.relationType).toBe('one-to-many');
    expect(productCategory?.relationType).toBe('many-to-one');
    expect(joinColumn?.name).toBe('productCategoryId');
  });

  it('configura o relacionamento entre ProductSituation e Product', () => {
    const relations = getMetadataArgsStorage().relations;
    const situationProducts = relations.find(
      (relation) => relation.target === ProductSituation && relation.propertyName === 'products',
    );
    const productSituation = relations.find(
      (relation) => relation.target === Product && relation.propertyName === 'productSituation',
    );
    const joinColumn = getMetadataArgsStorage().joinColumns.find(
      (column) => column.target === Product && column.propertyName === 'productSituation',
    );

    expect(situationProducts?.relationType).toBe('one-to-many');
    expect(productSituation?.relationType).toBe('many-to-one');
    expect(joinColumn?.name).toBe('productSituationId');
  });
});
