import { useState, useCallback, useMemo } from 'react';
import { TreeNode, ExpandedPaths } from '../types/tree';

/**
 * Хук для управления состоянием дерева (раскрытые узлы и данные)
 */
export function useTreeState() {
  // Используем Set для O(1) операций проверки и модификации
  const [expandedPaths, setExpandedPaths] = useState<ExpandedPaths>(new Set());

  // Все загруженные данные дерева
  const [treeData, setTreeData] = useState<Map<string, TreeNode>>(new Map());

  /**
   * Переключение раскрытия узла
   */
  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  /**
   * Проверка, раскрыт ли узел
   */
  const isExpanded = useCallback(
    (path: string) => expandedPaths.has(path),
    [expandedPaths]
  );

  /**
   * Добавление новых данных в дерево
   */
  const addTreeData = useCallback((nodes: TreeNode[]) => {
    setTreeData((prev) => {
      const next = new Map(prev);
      nodes.forEach((node) => {
        next.set(node.path, node);
      });
      return next;
    });
  }, []);

  /**
   * Получение отфильтрованного списка узлов для отображения
   */
  const visibleNodes = useMemo(() => {
    const nodes = Array.from(treeData.values());

    // Сортируем по path для правильного порядка
    nodes.sort((a, b) => a.path.localeCompare(b.path));

    // Фильтруем: показываем только те узлы, чьи родители раскрыты
    return nodes.filter((node) => {
      // Корневые узлы (depth === 1) всегда видимы
      if (node.depth === 1) {
        return true;
      }

      // Для остальных проверяем, раскрыт ли родитель
      const pathParts = node.path.split('/');
      pathParts.pop(); // Убираем id самого узла
      const parentPath = pathParts.join('/');

      return expandedPaths.has(parentPath);
    });
  }, [treeData, expandedPaths]);

  return {
    expandedPaths,
    toggleExpand,
    isExpanded,
    treeData,
    addTreeData,
    visibleNodes,
  };
}
