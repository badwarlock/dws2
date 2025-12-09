import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchTreeData } from '../api/tree';
import { TreeApiParams, TreeApiResponse, TreeNode } from '../types/tree';

/**
 * Ключи запросов для React Query
 */
export const treeQueryKeys = {
  all: ['tree'] as const,
  level: (depth: number, pathPart?: string) =>
    [...treeQueryKeys.all, 'level', depth, pathPart] as const,
};

/**
 * Хук для загрузки данных уровня дерева
 */
export function useTreeLevel(
  params: TreeApiParams,
  options?: Omit<UseQueryOptions<TreeApiResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: treeQueryKeys.level(params.depth, params.path_part),
    queryFn: () => fetchTreeData(params),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
    ...options,
  });
}

/**
 * Хук для prefetch данных (используется при ховере)
 */
export function usePrefetchTreeLevel() {
  const queryClient = useQueryClient();

  return useCallback(
    (node: TreeNode) => {
      // Не делаем prefetch для account - у них нет детей
      if (node.type === 'account') {
        return;
      }

      const childDepth = node.depth + 1;
      const pathPart = node.path.endsWith('/') ? node.path : `${node.path}/`;

      queryClient.prefetchQuery({
        queryKey: treeQueryKeys.level(childDepth, pathPart),
        queryFn: () => fetchTreeData({ depth: childDepth, path_part: pathPart }),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}
