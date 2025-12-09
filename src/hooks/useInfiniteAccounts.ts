import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPaginatedAccountsData } from '../api/tree';
import { TreeNode } from '../types/tree';

/**
 * Ключи запросов для infinite accounts
 */
export const infiniteAccountsQueryKeys = {
  accounts: (pathPart: string) => ['accounts', 'infinite', pathPart] as const,
};

/**
 * Параметры для хука useInfiniteAccounts
 */
interface UseInfiniteAccountsParams {
  pathPart: string;
  depth: number;
  enabled?: boolean;
  limit?: number;
}

/**
 * Хук для загрузки пагинированных accounts с использованием infinite query
 */
export function useInfiniteAccounts({
  pathPart,
  depth,
  enabled = true,
  limit = 10,
}: UseInfiniteAccountsParams) {
  return useInfiniteQuery({
    queryKey: infiniteAccountsQueryKeys.accounts(pathPart),
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam;
      const response = await fetchPaginatedAccountsData({
        depth,
        path_part: pathPart,
        limit,
        skip,
      });
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      // Если count есть и это общее количество
      if (lastPage.count !== undefined) {
        const totalFetched = allPages.reduce(
          (sum, page) => sum + (page.data?.length || 0),
          0
        );

        // Если загрузили все данные, возвращаем undefined
        if (totalFetched >= lastPage.count) {
          return undefined;
        }

        // Возвращаем skip для следующей страницы
        return totalFetched;
      }

      // Если нет данных, больше страниц нет
      if (!lastPage.data || lastPage.data.length === 0) {
        return undefined;
      }

      // Если получили меньше чем limit, значит это последняя страница
      if (lastPage.data.length < limit) {
        return undefined;
      }

      // Возвращаем skip для следующей страницы
      const totalFetched = allPages.reduce(
        (sum, page) => sum + (page.data?.length || 0),
        0
      );
      return totalFetched;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
}

/**
 * Утилита для получения всех загруженных accounts из infinite query
 */
export function getAllAccounts(data: any): TreeNode[] {
  if (!data?.pages) return [];

  return data.pages.flatMap((page: any) => page.data || []);
}

/**
 * Утилита для получения общего количества accounts
 */
export function getTotalCount(data: any): number {
  if (!data?.pages || data.pages.length === 0) return 0;

  // count должен быть одинаковым на всех страницах
  return data.pages[0]?.count || 0;
}
