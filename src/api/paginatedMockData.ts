/**
 * Mock данные для тестирования пагинированных accounts
 */

import { PaginatedAccountsParams, PaginatedAccountsResponse, TreeNode } from '../types/tree';

/**
 * Генерация большого количества accounts для тестирования виртуализации
 */
export function generatePaginatedAccounts(
  params: PaginatedAccountsParams
): PaginatedAccountsResponse {
  const { path_part, depth, limit, skip } = params;

  console.log('[Mock Paginated] Fetching accounts:', { path_part, depth, limit, skip });

  // Определяем общее количество accounts для разных path
  const totalAccountsByPath: Record<string, number> = {
    '3/': 150,          // leaf 3 имеет 150 accounts
    '1/12/': 75,        // leaf 1/12 имеет 75 accounts
    '2/21/': 200,       // leaf 2/21 имеет 200 accounts (для теста большого списка)
    '1/11/111/': 50,    // leaf 1/11/111 имеет 50 accounts
    '1/11/112/': 30,    // leaf 1/11/112 имеет 30 accounts
    '2/22/221/': 100,   // leaf 2/22/221 имеет 100 accounts
  };

  const totalCount = totalAccountsByPath[path_part] || 0;

  // Если нет accounts для этого path
  if (totalCount === 0) {
    return {
      count: 0,
      data: null,
    };
  }

  // Генерируем accounts для текущей страницы
  const accounts: TreeNode[] = [];
  const endIndex = Math.min(skip + limit, totalCount);

  for (let i = skip; i < endIndex; i++) {
    const accountId = parseInt(path_part.replace(/\//g, '')) * 1000 + i + 1;
    accounts.push({
      id: accountId,
      type: 'account',
      path: `${path_part.slice(0, -1)}/${accountId}`,
      depth: depth,
    });
  }

  return {
    count: totalCount,
    data: accounts.length > 0 ? accounts : null,
  };
}

/**
 * Mock функция для симуляции API запроса с пагинацией
 */
export async function fetchPaginatedAccounts(
  params: PaginatedAccountsParams
): Promise<PaginatedAccountsResponse> {
  // Симулируем задержку сети (150-300ms для быстрого отклика)
  const delay = Math.random() * 150 + 150;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const result = generatePaginatedAccounts(params);
  console.log('[Mock Paginated] Response:', {
    count: result.count,
    dataLength: result.data?.length || 0,
    skip: params.skip
  });

  return result;
}
