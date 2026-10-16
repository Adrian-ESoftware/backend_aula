import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { CreateSituationsSeeds } from '../src/seeds/create-situations-seeds';
import { Situation } from '../src/entity/Situation';

describe('CreateSituationsSeeds', () => {
  it('insere Ativo, Inativo e Pendente quando a tabela está vazia (count === 0)', async () => {
    const mockSave = vi.fn().mockResolvedValue([]);
    const mockCreate = vi.fn((data: any) => data);
    const mockRepository = {
      count: vi.fn().mockResolvedValue(0),
      create: mockCreate,
      save: mockSave,
    };
    const mockDataSource = {
      getRepository: vi.fn().mockReturnValue(mockRepository),
    } as any;

    const seed = new CreateSituationsSeeds(mockDataSource);
    await seed.run();

    expect(mockDataSource.getRepository).toHaveBeenCalledWith(Situation);
    expect(mockRepository.count).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({ nameSituation: 'Ativo' });
    expect(mockCreate).toHaveBeenCalledWith({ nameSituation: 'Inativo' });
    expect(mockCreate).toHaveBeenCalledWith({ nameSituation: 'Pendente' });
    expect(mockSave).toHaveBeenCalledWith([
      { nameSituation: 'Ativo' },
      { nameSituation: 'Inativo' },
      { nameSituation: 'Pendente' },
    ]);
  });

  it('não insere dados quando a tabela já possui registros (count > 0)', async () => {
    const mockSave = vi.fn();
    const mockRepository = {
      count: vi.fn().mockResolvedValue(3),
      create: vi.fn(),
      save: mockSave,
    };
    const mockDataSource = {
      getRepository: vi.fn().mockReturnValue(mockRepository),
    } as any;

    const seed = new CreateSituationsSeeds(mockDataSource);
    await seed.execute();

    expect(mockDataSource.getRepository).toHaveBeenCalledWith(Situation);
    expect(mockRepository.count).toHaveBeenCalledTimes(1);
    expect(mockSave).not.toHaveBeenCalled();
  });
});
