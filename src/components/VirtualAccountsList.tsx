import { memo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteAccounts, getAllAccounts, getTotalCount } from '../hooks/useInfiniteAccounts';
import { TreeNode } from '../types/tree';

interface VirtualAccountsListProps {
  pathPart: string;
  depth: number;
  indent: number;
}

/**
 * Виртуализированный список accounts с infinite scrolling
 */
export const VirtualAccountsList = memo<VirtualAccountsListProps>(
  ({ pathPart, depth, indent }) => {
    const parentRef = useRef<HTMLDivElement>(null);

    // Infinite query для загрузки accounts порциями
    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      error,
    } = useInfiniteAccounts({
      pathPart,
      depth,
      enabled: true,
      limit: 10,
    });

    // Получаем все загруженные accounts
    const allAccounts = getAllAccounts(data);
    const totalCount = getTotalCount(data);

    // Настройка виртуализатора
    const virtualizer = useVirtualizer({
      count: hasNextPage ? allAccounts.length + 1 : allAccounts.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 45, // Примерная высота строки таблицы
      overscan: 5, // Количество дополнительных элементов для рендера
    });

    // Автоматическая подгрузка при достижении конца списка
    useEffect(() => {
      const items = virtualizer.getVirtualItems();
      if (items.length === 0) return;

      const lastItem = items[items.length - 1];
      if (!lastItem) return;

      // Если дошли почти до конца и есть ещё страницы
      if (
        lastItem.index >= allAccounts.length - 1 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        console.log('[Virtual List] Loading next page...', {
          pathPart,
          currentLength: allAccounts.length,
          totalCount,
        });
        fetchNextPage();
      }
    }, [
      virtualizer.getVirtualItems(),
      allAccounts.length,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      pathPart,
      totalCount,
    ]);

    // Состояние загрузки
    if (isLoading) {
      return (
        <tr className="loading-row">
          <td colSpan={4}>
            <div
              style={{
                paddingLeft: `${indent}px`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="loading-spinner-small"></span>
              <span style={{ color: '#666', fontSize: '13px' }}>
                Загрузка accounts...
              </span>
            </div>
          </td>
        </tr>
      );
    }

    // Состояние ошибки
    if (error) {
      return (
        <tr className="error-row">
          <td colSpan={4}>
            <div style={{ paddingLeft: `${indent}px`, color: '#ff4d4f', fontSize: '13px' }}>
              ⚠️ Ошибка загрузки accounts: {(error as Error).message}
            </div>
          </td>
        </tr>
      );
    }

    // Нет данных
    if (!allAccounts || allAccounts.length === 0) {
      return (
        <tr className="no-data-row">
          <td colSpan={4}>
            <div
              style={{
                paddingLeft: `${indent}px`,
                color: '#999',
                fontSize: '13px',
                fontStyle: 'italic',
              }}
            >
              📭 Нет accounts
            </div>
          </td>
        </tr>
      );
    }

    return (
      <>
        {/* Информационная строка */}
        <tr className="virtual-info-row">
          <td colSpan={4}>
            <div
              style={{
                paddingLeft: `${indent}px`,
                fontSize: '12px',
                color: '#999',
                padding: '4px 0',
                background: '#fafafa',
              }}
            >
              📊 Accounts: {allAccounts.length} / {totalCount}
              {hasNextPage && ' (загрузка при прокрутке...)'}
            </div>
          </td>
        </tr>

        {/* Виртуальный контейнер */}
        <tr>
          <td colSpan={4} style={{ padding: 0 }}>
            <div
              ref={parentRef}
              style={{
                height: '400px',
                overflow: 'auto',
                border: '1px solid #e8e8e8',
                borderRadius: '4px',
                background: '#fafafa',
              }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const isLoaderRow = virtualItem.index >= allAccounts.length;
                  const account = allAccounts[virtualItem.index];

                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      {isLoaderRow ? (
                        <div
                          style={{
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'white',
                          }}
                        >
                          <span className="loading-spinner-small"></span>
                          <span style={{ color: '#666', fontSize: '13px' }}>
                            Загрузка следующих accounts...
                          </span>
                        </div>
                      ) : (
                        <AccountRow account={account} indent={indent} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </td>
        </tr>
      </>
    );
  }
);

VirtualAccountsList.displayName = 'VirtualAccountsList';

/**
 * Компонент строки account (мемоизирован)
 */
interface AccountRowProps {
  account: TreeNode;
  indent: number;
}

const AccountRow = memo<AccountRowProps>(({ account, indent }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        background: 'white',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
      }}
    >
      <div style={{ paddingLeft: `${indent}px` }}>{account.id}</div>
      <div>
        <span className="node-type node-type-account">account</span>
      </div>
      <div>{account.path}</div>
      <div>{account.depth}</div>
    </div>
  );
});

AccountRow.displayName = 'AccountRow';
