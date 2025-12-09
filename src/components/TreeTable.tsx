import { memo, useCallback, useEffect } from 'react';
import { useTreeLevel, usePrefetchTreeLevel } from '../hooks/useTreeData';
import { useTreeState } from '../hooks/useTreeState';
import { TreeNode } from '../types/tree';
import { TreeTableRow } from './TreeTableRow';

interface TreeTableProps {
  apiBaseUrl?: string;
}

/**
 * Основной компонент таблицы дерева
 */
export const TreeTable = memo<TreeTableProps>(() => {
  const {
    expandedPaths,
    toggleExpand,
    isExpanded,
    addTreeData,
    visibleNodes,
  } = useTreeState();

  const prefetchTreeLevel = usePrefetchTreeLevel();

  // Загружаем корневой уровень (depth: 1)
  const { data: rootData, isLoading: isRootLoading, error: rootError } = useTreeLevel({
    depth: 1,
  });

  // Добавляем корневые данные в состояние
  useEffect(() => {
    if (rootData?.data) {
      addTreeData(rootData.data);
    }
  }, [rootData, addTreeData]);

  // Обработчик ховера (prefetch дочерних элементов)
  const handleMouseEnter = useCallback(
    (node: TreeNode) => {
      prefetchTreeLevel(node);
    },
    [prefetchTreeLevel]
  );

  // Обработчик клика (раскрытие/закрытие узла)
  const handleClick = useCallback(
    (node: TreeNode) => {
      if (node.type === 'account') {
        return; // account не имеет дочерних элементов
      }

      toggleExpand(node.path);
    },
    [toggleExpand]
  );

  // Отображение состояний загрузки и ошибок
  if (isRootLoading) {
    return <div>Загрузка...</div>;
  }

  if (rootError) {
    return <div>Ошибка: {(rootError as Error).message}</div>;
  }

  if (!rootData?.data || rootData.data.length === 0) {
    return <div>Нет данных</div>;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>
              ID
            </th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>
              Type
            </th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>
              Path
            </th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>
              Depth
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleNodes.map((node) => (
            <TreeTableRowWithData
              key={node.path}
              node={node}
              isExpanded={isExpanded(node.path)}
              expandedPaths={expandedPaths}
              addTreeData={addTreeData}
              onMouseEnter={() => handleMouseEnter(node)}
              onClick={() => handleClick(node)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

TreeTable.displayName = 'TreeTable';

/**
 * Обертка для строки с загрузкой данных
 */
interface TreeTableRowWithDataProps {
  node: TreeNode;
  isExpanded: boolean;
  expandedPaths: Set<string>;
  addTreeData: (nodes: TreeNode[]) => void;
  onMouseEnter: () => void;
  onClick: () => void;
}

const TreeTableRowWithData = memo<TreeTableRowWithDataProps>(
  ({ node, isExpanded, expandedPaths, addTreeData, onMouseEnter, onClick }) => {
    const childDepth = node.depth + 1;
    const pathPart = node.path.endsWith('/') ? node.path : `${node.path}/`;

    // Загружаем дочерние элементы, если узел раскрыт
    const shouldFetch = isExpanded && node.type !== 'account';

    const { data: childData, isLoading } = useTreeLevel(
      { depth: childDepth, path_part: pathPart },
      {
        enabled: shouldFetch,
      }
    );

    // Добавляем дочерние данные в состояние
    useEffect(() => {
      if (childData?.data) {
        addTreeData(childData.data);
      }
    }, [childData, addTreeData]);

    return (
      <TreeTableRow
        node={node}
        isExpanded={isExpanded}
        isLoading={isLoading}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      />
    );
  }
);

TreeTableRowWithData.displayName = 'TreeTableRowWithData';
