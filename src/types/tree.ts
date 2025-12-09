/**
 * Типы элементов дерева
 */
export type TreeNodeType = 'node' | 'leaf' | 'account';

/**
 * Базовый элемент дерева
 */
export interface TreeNode {
  id: number;
  type: TreeNodeType;
  path: string;
  depth: number;
}

/**
 * Ответ API при запросе элементов дерева
 */
export interface TreeApiResponse {
  count: number;
  data: TreeNode[] | null;
}

/**
 * Параметры запроса к API
 */
export interface TreeApiParams {
  depth: number;
  path_part?: string;
}

/**
 * Состояние раскрытых узлов
 */
export type ExpandedPaths = Set<string>;
