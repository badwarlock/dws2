/**
 * Mock данные для тестирования компонента дерева
 * Используется когда реальный API недоступен
 */

import { TreeNode, TreeApiResponse } from '../types/tree';

/**
 * Генерация mock данных для различных уровней дерева
 */
export function generateMockData(depth: number, pathPart?: string): TreeApiResponse {
  // Симуляция задержки сети
  const nodes: TreeNode[] = [];

  if (depth === 1) {
    // Корневой уровень
    nodes.push(
      { id: 1, type: 'node', path: '1', depth: 1 },
      { id: 2, type: 'node', path: '2', depth: 1 },
      { id: 3, type: 'leaf', path: '3', depth: 1 }
    );
  } else if (pathPart === '1/') {
    // Дочерние элементы узла 1
    nodes.push(
      { id: 11, type: 'node', path: '1/11', depth: 2 },
      { id: 12, type: 'leaf', path: '1/12', depth: 2 }
    );
  } else if (pathPart === '2/') {
    // Дочерние элементы узла 2
    nodes.push(
      { id: 21, type: 'leaf', path: '2/21', depth: 2 },
      { id: 22, type: 'node', path: '2/22', depth: 2 }
    );
  } else if (pathPart === '3/') {
    // Дочерние элементы leaf 3 (только accounts)
    nodes.push(
      { id: 31, type: 'account', path: '3/31', depth: 2 },
      { id: 32, type: 'account', path: '3/32', depth: 2 },
      { id: 33, type: 'account', path: '3/33', depth: 2 }
    );
  } else if (pathPart === '1/11/') {
    // Третий уровень вложенности
    nodes.push(
      { id: 111, type: 'leaf', path: '1/11/111', depth: 3 },
      { id: 112, type: 'leaf', path: '1/11/112', depth: 3 }
    );
  } else if (pathPart === '1/12/') {
    nodes.push(
      { id: 121, type: 'account', path: '1/12/121', depth: 3 },
      { id: 122, type: 'account', path: '1/12/122', depth: 3 }
    );
  } else if (pathPart === '2/22/') {
    nodes.push(
      { id: 221, type: 'leaf', path: '2/22/221', depth: 3 }
    );
  } else if (pathPart === '1/11/111/') {
    // Четвертый уровень
    nodes.push(
      { id: 1111, type: 'account', path: '1/11/111/1111', depth: 4 },
      { id: 1112, type: 'account', path: '1/11/111/1112', depth: 4 }
    );
  } else if (pathPart === '1/11/112/') {
    nodes.push(
      { id: 1121, type: 'account', path: '1/11/112/1121', depth: 4 }
    );
  } else if (pathPart === '2/22/221/') {
    nodes.push(
      { id: 2211, type: 'account', path: '2/22/221/2211', depth: 4 },
      { id: 2212, type: 'account', path: '2/22/221/2212', depth: 4 },
      { id: 2213, type: 'account', path: '2/22/221/2213', depth: 4 }
    );
  }

  return {
    count: nodes.length,
    data: nodes.length > 0 ? nodes : null,
  };
}

/**
 * Mock функция для симуляции API запроса
 */
export async function fetchMockTreeData(
  depth: number,
  pathPart?: string
): Promise<TreeApiResponse> {
  console.log('[Mock Data] Request:', { depth, pathPart });

  // Симулируем задержку сети (200-500ms для быстрого отклика)
  const delay = Math.random() * 300 + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Симулируем редкие ошибки (1% вероятность - очень редко)
  // Закомментируйте следующие 3 строки, чтобы полностью отключить ошибки
  // if (Math.random() < 0.01) {
  //   throw new Error('Ошибка сети: не удалось загрузить данные');
  // }

  const result = generateMockData(depth, pathPart);
  console.log('[Mock Data] Response:', result);

  return result;
}
