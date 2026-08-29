import { describe, expect, it } from 'vitest';
import { createRecoveryToken, hashRecoveryToken, parseId } from '../src/utils';

describe('utils', () => {
  it('gera e transforma tokens de recuperação', () => {
    const token = createRecoveryToken();
    expect(token).toHaveLength(64);
    expect(hashRecoveryToken(token)).toHaveLength(64);
  });

  it('valida identificadores positivos', () => {
    expect(parseId('12')).toBe(12);
    expect(() => parseId('abc')).toThrow('Identificador inválido.');
  });
});
