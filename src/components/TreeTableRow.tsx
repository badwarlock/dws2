import { memo } from 'react';
import { TreeNode } from '../types/tree';

interface TreeTableRowProps {
  node: TreeNode;
  isExpanded: boolean;
  isLoading: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

/**
 * Компонент строки таблицы дерева (мемоизирован для предотвращения лишних ре-рендеров)
 */
export const TreeTableRow = memo<TreeTableRowProps>(
  ({ node, isExpanded, isLoading, onMouseEnter, onClick }) => {
    const canExpand = node.type !== 'account';
    const indent = (node.depth - 1) * 20; // 20px на каждый уровень вложенности

    return (
      <tr
        onMouseEnter={onMouseEnter}
        onClick={canExpand ? onClick : undefined}
        style={{
          cursor: canExpand ? 'pointer' : 'default',
        }}
      >
        <td style={{ paddingLeft: `${indent}px` }}>
          {canExpand && (
            <span style={{ marginRight: '8px' }}>
              {isLoading ? '⏳' : isExpanded ? '▼' : '▶'}
            </span>
          )}
          {node.id}
        </td>
        <td>{node.type}</td>
        <td>{node.path}</td>
        <td>{node.depth}</td>
      </tr>
    );
  }
);

TreeTableRow.displayName = 'TreeTableRow';
