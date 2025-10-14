import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../dto/paginated-query.dto';
import { PaginatedResult, PaginatedResponse } from '../types/pagination';

export const normalizePagination = (
  page?: number,
  limit?: number
): { page: number; limit: number; skip: number } => {
  const normalizedLimit = Math.min(Math.max(limit ?? DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT);
  const normalizedPage = Math.max(page ?? 1, 1);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
};

export const buildPaginatedResponse = <T, R = T>(
  result: PaginatedResult<T>,
  mapper?: (item: T) => R
): PaginatedResponse<R> => {
  const items = mapper ? result.items.map(mapper) : (result.items as unknown as R[]);
  const totalPages = Math.max(Math.ceil(result.total / result.limit), 1);

  return {
    data: items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages
    }
  };
};
