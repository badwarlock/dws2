import { TreeApiResponse, TreeApiParams } from '../types/tree';
import { fetchMockTreeData } from './mockData';

/**
 * Базовый URL API (замените на реальный)
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://my-url';

/**
 * Режим использования mock данных (для тестирования без реального API)
 * Установите VITE_USE_MOCK_DATA=true в .env файле для использования mock данных
 */
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Функция для запроса данных дерева
 */
export async function fetchTreeData(params: TreeApiParams): Promise<TreeApiResponse> {
  const { depth, path_part } = params;

  // Если включен режим mock данных, используем локальные данные
  if (USE_MOCK_DATA) {
    console.log('[MOCK MODE] Fetching mock data:', { depth, path_part });
    return fetchMockTreeData(depth, path_part);
  }

  // Реальный API запрос
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
