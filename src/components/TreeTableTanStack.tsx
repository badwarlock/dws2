import { memo, useCallback, useEffect, useMemo, Fragment } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useTreeLevel, usePrefetchTreeLevel } from '../hooks/useTreeData';
import { useTreeState } from '../hooks/useTreeState';
import { TreeNode } from '../types/tree';
import { VirtualAccountsList } from './VirtualAccountsList';

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
                <span className="expand-icon">
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
        cell: ({ row }) => {
          const node = row.original;
          return (
            <span className={`node-type node-type-${node.type}`}>
              {node.type}
            </span>
          );
        },
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
    return (
      <div className="tree-table-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div>Загрузка данных...</div>
        </div>
      </div>
    );
  }

  if (rootError) {
    return (
      <div className="tree-table-container">
        <div className="error-state">
          <div>⚠️ Ошибка загрузки</div>
          <div>{(rootError as Error).message}</div>
        </div>
      </div>
    );
  }

  if (!rootData?.data || rootData.data.length === 0) {
    return (
      <div className="tree-table-container">
        <div className="no-data-state">
          <div>📭 Нет данных для отображения</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-table-container">
      <table className="tree-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
    const indent = node.depth * 20; // Отступ для дочерних элементов

    // Определяем, нужно ли использовать виртуальный список для accounts
    const isLeafNode = node.type === 'leaf';
    const shouldUseVirtualList = isExpanded && isLeafNode;

    // Для node загружаем дочерние элементы обычным способом
    const shouldFetchRegular = isExpanded && node.type === 'node';

    const { data: childData, isLoading, error } = useTreeLevel(
      { depth: childDepth, path_part: pathPart },
      {
        enabled: shouldFetchRegular,
      }
    );

    // Добавляем дочерние данные в состояние (только для node)
    useEffect(() => {
      if (childData?.data && node.type === 'node') {
        addTreeData(childData.data);
      }
    }, [childData, addTreeData, node.type]);

    const canExpand = node.type !== 'account';

    return (
      <Fragment>
        {/* Основная строка узла */}
        <tr
          className={canExpand ? 'expandable' : ''}
          onMouseEnter={onMouseEnter}
          onClick={canExpand ? onClick : undefined}
        >
          {row.getVisibleCells().map((cell: any) => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>

        {/* Виртуальный список для leaf-узлов (accounts) */}
        {shouldUseVirtualList && (
          <VirtualAccountsList
            pathPart={pathPart}
            depth={childDepth}
            indent={indent}
          />
        )}

        {/* Обычная загрузка для node-узлов */}
        {shouldFetchRegular && (
          <Fragment>
            {/* Строка загрузки */}
            {isLoading && (
              <tr className="loading-row">
                <td colSpan={4}>
                  <div style={{ paddingLeft: `${indent}px`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="loading-spinner-small"></span>
                    <span style={{ color: '#666', fontSize: '13px' }}>Загрузка дочерних элементов...</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Строка ошибки */}
            {error && (
              <tr className="error-row">
                <td colSpan={4}>
                  <div style={{ paddingLeft: `${indent}px`, color: '#ff4d4f', fontSize: '13px' }}>
                    ⚠️ Ошибка загрузки: {(error as Error).message}
                  </div>
                </td>
              </tr>
            )}

            {/* Строка "нет данных" */}
            {!isLoading && !error && childData && (!childData.data || childData.data.length === 0) && (
              <tr className="no-data-row">
                <td colSpan={4}>
                  <div style={{ paddingLeft: `${indent}px`, color: '#999', fontSize: '13px', fontStyle: 'italic' }}>
                    📭 Нет дочерних элементов
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }
);

TreeTableRowWithData.displayName = 'TreeTableRowWithData';
