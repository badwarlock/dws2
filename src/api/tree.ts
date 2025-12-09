import { TreeApiResponse, TreeApiParams } from '../types/tree';

/**
 * Базовый URL API (замените на реальный)
 */
const API_BASE_URL = 'https://my-url';

/**
 * Функция для запроса данных дерева
 */
export async function fetchTreeData(params: TreeApiParams): Promise<TreeApiResponse> {
  const { depth, path_part } = params;

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
