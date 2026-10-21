import { FindOptionsOrder, FindOptionsRelations, ObjectLiteral, Repository } from 'typeorm';

export interface PaginationResult<T> {
  error: boolean;
  data: T[];
  currentPage: number;
  lastPage: number;
  totalRecords: number;
}

export class PaginationService {
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    page: number = 1,
    limit: number = 10,
    order: FindOptionsOrder<T> = {},
    relations?: FindOptionsRelations<T>
  ): Promise<PaginationResult<T>> {
    const totalRecords = await repository.count();
    const lastPage = Math.ceil(totalRecords / limit);

    if (lastPage > 0 && page > lastPage) {
      throw new Error(`Página inválida. Total de páginas: ${lastPage}`);
    }

    const offset = (page - 1) * limit;

    const data = await repository.find({
      take: limit,
      skip: offset,
      order,
      ...(relations ? { relations } : {}),
    });

    return {
      error: false,
      data,
      currentPage: Number(page),
      lastPage,
      totalRecords,
    };
  }
}

export default PaginationService;
