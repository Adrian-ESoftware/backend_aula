import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PaginationService } from '../src/services/pagination.service';

describe('PaginationService', () => {
  it('retorna os dados paginados e metadados corretamente', async () => {
    const mockData = [{ id: 3, name: 'Ativo' }, { id: 2, name: 'Inativo' }];
    const mockRepo = {
      count: vi.fn().mockResolvedValue(5),
      find: vi.fn().mockResolvedValue(mockData),
    } as any;

    const result = await PaginationService.paginate(mockRepo, 1, 2, { id: 'DESC' });

    expect(mockRepo.count).toHaveBeenCalledTimes(1);
    expect(mockRepo.find).toHaveBeenCalledWith({
      take: 2,
      skip: 0,
      order: { id: 'DESC' },
    });
    expect(result).toEqual({
      error: false,
      data: mockData,
      currentPage: 1,
      lastPage: 3,
      totalRecords: 5,
    });
  });

  it('calcula o offset correto para páginas subsequentes', async () => {
    const mockData = [{ id: 1, name: 'Pendente' }];
    const mockRepo = {
      count: vi.fn().mockResolvedValue(5),
      find: vi.fn().mockResolvedValue(mockData),
    } as any;

    const result = await PaginationService.paginate(mockRepo, 3, 2);

    expect(mockRepo.find).toHaveBeenCalledWith({
      take: 2,
      skip: 4,
      order: {},
    });
    expect(result.currentPage).toBe(3);
    expect(result.lastPage).toBe(3);
  });

  it('lança exceção quando a página solicitada é maior que lastPage', async () => {
    const mockRepo = {
      count: vi.fn().mockResolvedValue(5),
      find: vi.fn(),
    } as any;

    await expect(PaginationService.paginate(mockRepo, 4, 2)).rejects.toThrow(
      'Página inválida. Total de páginas: 3'
    );
    expect(mockRepo.find).not.toHaveBeenCalled();
  });

  it('não lança erro de página inválida se a tabela estiver vazia (lastPage === 0)', async () => {
    const mockRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
    } as any;

    const result = await PaginationService.paginate(mockRepo, 1, 10);

    expect(result).toEqual({
      error: false,
      data: [],
      currentPage: 1,
      lastPage: 0,
      totalRecords: 0,
    });
  });
});
