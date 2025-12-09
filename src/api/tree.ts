import { TreeApiResponse, TreeApiParams, PaginatedAccountsParams, PaginatedAccountsResponse } from '../types/tree';
import { fetchMockTreeData } from './mockData';
import { fetchPaginatedAccounts as fetchMockPaginatedAccounts } from './paginatedMockData';

/**
 * Базовый URL API (замените на реальный)
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://my-url';

/**
 * Режим использования mock данных (для тестирования без реального API)
 * По умолчанию используем mock данные для разработки
 */
const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  !import.meta.env.VITE_USE_MOCK_DATA; // Если не установлено, используем mock

/**
 * Функция для запроса данных дерева
 */
export async function fetchTreeData(params: TreeApiParams): Promise<TreeApiResponse> {
  const { depth, path_part } = params;

  // Если включен режим mock данных, используем локальные данные
  if (USE_MOCK_DATA) {
    console.log('[MOCK MODE] Fetching data for:', { depth, path_part });
    return fetchMockTreeData(depth, path_part);
  }

  // Реальный API запрос
  console.log('[API MODE] Fetching from:', API_BASE_URL, { depth, path_part });
  const url = new URL(`${API_BASE_URL}/account`);
  url.searchParams.append('depth', depth.toString());

  if (path_part) {
    url.searchParams.append('path_part', path_part);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Функция для запроса пагинированных accounts
 */
export async function fetchPaginatedAccountsData(
  params: PaginatedAccountsParams
): Promise<PaginatedAccountsResponse> {
  const { depth, path_part, limit, skip } = params;

  // Если включен режим mock данных, используем локальные данные
  if (USE_MOCK_DATA) {
    console.log('[MOCK MODE] Fetching paginated accounts:', { depth, path_part, limit, skip });
    return fetchMockPaginatedAccounts(params);
  }

  // Реальный API запрос
  console.log('[API MODE] Fetching paginated accounts from:', API_BASE_URL, {
    depth,
    path_part,
    limit,
    skip,
  });
  const url = new URL(`${API_BASE_URL}/account`);
  url.searchParams.append('depth', depth.toString());
  url.searchParams.append('path_part', path_part);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('skip', skip.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
