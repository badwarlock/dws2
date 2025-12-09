import { memo, useCallback, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useTreeLevel, usePrefetchTreeLevel } from '../hooks/useTreeData';
import { useTreeState } from '../hooks/useTreeState';
import { TreeNode } from '../types/tree';

interface TreeTableTanStackProps {
  apiBaseUrl?: string;
}

/**
 * Компонент таблицы дерева с использованием TanStack Table
 */
export const TreeTableTanStack = memo<TreeTableTanStackProps>(() => {
  const {
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

  // Определение колонок с использованием useMemo для оптимизации
  const columns = useMemo<ColumnDef<TreeNode>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => {
          const node = row.original;
          const canExpand = node.type !== 'account';
          const indent = (node.depth - 1) * 20;
          const expanded = isExpanded(node.path);

          return (
            <div style={{ paddingLeft: `${indent}px`, display: 'flex', alignItems: 'center' }}>
              {canExpand && (
                <span style={{ marginRight: '8px' }}>
                  {expanded ? '▼' : '▶'}
                </span>
              )}
              {node.id}
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
      },
      {
        accessorKey: 'path',
        header: 'Path',
      },
      {
        accessorKey: 'depth',
        header: 'Depth',
      },
    ],
    [isExpanded]
  );

  // Создание таблицы с использованием TanStack Table
  const table = useReactTable({
    data: visibleNodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <TreeTableRowWithData
              key={row.id}
              row={row}
              isExpanded={isExpanded(row.original.path)}
              addTreeData={addTreeData}
              onMouseEnter={() => handleMouseEnter(row.original)}
              onClick={() => handleClick(row.original)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

TreeTableTanStack.displayName = 'TreeTableTanStack';

/**
 * Обертка для строки с загрузкой данных
 */
interface TreeTableRowWithDataProps {
  row: any;
  isExpanded: boolean;
  addTreeData: (nodes: TreeNode[]) => void;
  onMouseEnter: () => void;
  onClick: () => void;
}

const TreeTableRowWithData = memo<TreeTableRowWithDataProps>(
  ({ row, isExpanded, addTreeData, onMouseEnter, onClick }) => {
    const node = row.original as TreeNode;
    const childDepth = node.depth + 1;
    const pathPart = node.path.endsWith('/') ? node.path : `${node.path}/`;

    // Загружаем дочерние элементы, если узел раскрыт
    const shouldFetch = isExpanded && node.type !== 'account';

    const { data: childData } = useTreeLevel(
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

    const canExpand = node.type !== 'account';

    return (
      <tr
        onMouseEnter={onMouseEnter}
        onClick={canExpand ? onClick : undefined}
        style={{
          cursor: canExpand ? 'pointer' : 'default',
          borderBottom: '1px solid #eee',
        }}
      >
        {row.getVisibleCells().map((cell: any) => (
          <td key={cell.id} style={{ padding: '8px' }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    );
  }
);

TreeTableRowWithData.displayName = 'TreeTableRowWithData';
