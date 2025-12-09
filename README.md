# Tree Table Component

Компонент для отрисовки иерархического дерева в виде таблицы с использованием React, TypeScript, TanStack Query и TanStack Table.

## Возможности

- ✅ Ленивая загрузка данных (lazy loading)
- ✅ Prefetching при ховере для быстрого отклика
- ✅ Раскрытие/закрытие узлов по клику
- ✅ Поддержка иерархии: node → (node | leaf) → account
- ✅ Обработка состояний: loading, error, no data
- ✅ Оптимизация производительности (React.memo, useMemo, useCallback, Set)

## Структура проекта

```
src/
├── api/
│   ├── tree.ts              # API функции для загрузки данных
│   └── mockData.ts          # Mock данные для тестирования
├── components/
│   ├── TreeTable.tsx        # Простая версия без TanStack Table
│   ├── TreeTableRow.tsx     # Компонент строки таблицы
│   └── TreeTableTanStack.tsx # Версия с TanStack Table (рекомендуется)
├── hooks/
│   ├── useTreeData.ts       # Хуки для работы с React Query
│   └── useTreeState.ts      # Хук для управления состоянием дерева
├── types/
│   └── tree.ts              # TypeScript типы
├── App.tsx                  # Главный компонент приложения
├── main.tsx                 # Точка входа
└── index.css                # Глобальные стили
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

По умолчанию используются **mock данные** для тестирования. Приложение будет доступно по адресу `http://localhost:5173`

### 3. Работа с реальным API

Создайте файл `.env` (или скопируйте `.env.example`):

```env
VITE_API_BASE_URL=https://your-api-url.com
VITE_USE_MOCK_DATA=false
```

### 4. Сборка для продакшена

```bash
npm run build
```

### 📖 Подробная документация

См. [DEVELOPMENT.md](./DEVELOPMENT.md) для детальных инструкций по разработке, настройке и кастомизации.

## Структура данных

### TreeNode

```typescript
interface TreeNode {
  id: number;
  type: 'node' | 'leaf' | 'account';
  path: string;      // Например: "1" или "1/2/3"
  depth: number;     // Уровень вложенности (начиная с 1)
}
```

### API Response

```typescript
interface TreeApiResponse {
  count: number;               // Количество элементов на уровне
  data: TreeNode[] | null;     // Массив элементов или null
}
```

## API Endpoints

### Получение корневого уровня
```
GET https://my-url/account?depth=1
```

### Получение дочерних элементов
```
GET https://my-url/account?depth=2&path_part=1/
```

Параметры:
- `depth` - уровень вложенности дочерних элементов (родитель.depth + 1)
- `path_part` - путь родителя с `/` на конце

## Использование

### Базовое использование

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TreeTableTanStack } from './components/TreeTableTanStack';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TreeTableTanStack />
    </QueryClientProvider>
  );
}
```

### Настройка API URL

Измените константу `API_BASE_URL` в файле `src/api/tree.ts`:

```typescript
const API_BASE_URL = 'https://your-api-url';
```

## Архитектура и оптимизации

### 1. Управление состоянием

- **Set для expandedPaths** - O(1) операции проверки и модификации раскрытых узлов
- **Map для treeData** - эффективное хранение и поиск узлов по path
- **useMemo для visibleNodes** - кэширование отфильтрованного списка узлов

### 2. Оптимизация рендеринга

- **React.memo** - мемоизация компонентов для предотвращения лишних ре-рендеров
- **useCallback** - стабильные обработчики событий
- **useMemo** - кэширование колонок таблицы

### 3. Работа с данными

- **TanStack Query** - кэширование запросов, автоматический retry, управление состояниями
- **Prefetching** - предзагрузка данных при ховере для мгновенного отклика
- **Lazy loading** - загрузка данных только при раскрытии узла

### 4. Иерархия типов

```
node → может содержать node или leaf
leaf → всегда содержит только account
account → конечный элемент, не содержит дочерних элементов
```

## Поведение компонента

### При ховере на элемент
- Выполняется prefetch дочерних элементов (если тип не `account`)
- Визуально дерево НЕ раскрывается
- Данные кэшируются для быстрого отображения при клике

### При клике на элемент
- Если элемент типа `account` - ничего не происходит
- Иначе:
  - Первый клик - раскрывает узел, загружает и отображает дочерние элементы
  - Повторный клик - закрывает узел, скрывает дочерние элементы (данные остаются в кэше)

## Состояния компонента

### Loading
Отображается при первоначальной загрузке корневого уровня:
```tsx
<div>Загрузка...</div>
```

### Error
Отображается при ошибке загрузки данных:
```tsx
<div>Ошибка: {errorMessage}</div>
```

### No Data
Отображается когда API возвращает пустой массив:
```tsx
<div>Нет данных</div>
```

## Файлы компонентов

### TreeTableTanStack.tsx (рекомендуется)
Полная интеграция с TanStack Table для расширенной функциональности таблиц.

### TreeTable.tsx
Простая версия без TanStack Table для минимальных требований.

### TreeTableRow.tsx
Мемоизированный компонент строки с индентацией и индикаторами раскрытия.

## Кастомизация

### Изменение визуального отступа

В `TreeTableRow.tsx` или `TreeTableTanStack.tsx`:
```typescript
const indent = (node.depth - 1) * 20; // 20px на уровень
```

### Изменение иконок раскрытия

```typescript
{isExpanded ? '▼' : '▶'}  // Замените на свои иконки
```

### Настройка кэширования

В `src/hooks/useTreeData.ts`:
```typescript
staleTime: 5 * 60 * 1000,  // Время актуальности данных
gcTime: 10 * 60 * 1000,    // Время хранения в кэше
```

## Типичные сценарии использования

### Добавление новых колонок

В `TreeTableTanStack.tsx`, в массиве `columns`:
```typescript
{
  accessorKey: 'yourField',
  header: 'Your Header',
  cell: ({ row }) => {
    // Кастомная логика отрисовки
    return <div>{row.original.yourField}</div>;
  },
}
```

### Обработка кастомных событий

```typescript
const handleCustomAction = useCallback((node: TreeNode) => {
  // Ваша логика
}, []);
```

## Зависимости

- `react` ^18.3.1
- `react-dom` ^18.3.1
- `@tanstack/react-query` ^5.59.0
- `@tanstack/react-table` ^8.20.5
- `typescript` ^5.6.3

## Лицензия

MIT
