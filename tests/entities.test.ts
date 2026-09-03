import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';
import { Situations } from '../src/entity/Situations';
import { Users } from '../src/entity/Users';

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

  it('mantém o e-mail único', () => {
    const email = getMetadataArgsStorage().columns.find(
      (column) => column.target === Users && column.propertyName === 'email',
    );
    expect(email?.options.unique).toBe(true);
  });
});
