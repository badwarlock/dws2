# Руководство по разработке

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

### 3. Сборка для продакшена

```bash
npm run build
```

### 4. Предпросмотр production сборки

```bash
npm run preview
```

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта (или скопируйте `.env.example`):

```env
# URL вашего API
VITE_API_BASE_URL=https://your-api-url.com

# Использовать mock данные для тестирования (true/false)
VITE_USE_MOCK_DATA=true
```

### Режимы работы

#### Режим Mock данных (по умолчанию)

Для тестирования без реального API:
- Установите `VITE_USE_MOCK_DATA=true` в `.env`
- Компонент будет использовать данные из `src/api/mockData.ts`
- Mock данные включают задержки сети и редкие ошибки для реалистичности

#### Режим реального API

Для работы с реальным API:
- Установите `VITE_USE_MOCK_DATA=false` в `.env`
- Укажите `VITE_API_BASE_URL=https://your-api-url.com`
- Компонент будет делать реальные HTTP запросы

## Структура проекта

```
dws2/
├── src/
│   ├── api/
│   │   ├── tree.ts           # API функции
│   │   └── mockData.ts       # Mock данные для тестирования
│   ├── components/
│   │   ├── TreeTableTanStack.tsx  # Основной компонент (с TanStack Table)
│   │   ├── TreeTable.tsx          # Простая версия
│   │   └── TreeTableRow.tsx       # Компонент строки
│   ├── hooks/
│   │   ├── useTreeData.ts    # React Query хуки
│   │   └── useTreeState.ts   # Управление состоянием дерева
│   ├── types/
│   │   └── tree.ts           # TypeScript типы
│   ├── App.tsx               # Главный компонент
│   ├── main.tsx              # Точка входа
│   └── index.css             # Глобальные стили
├── .env                       # Переменные окружения (не коммитить!)
├── .env.example              # Пример конфигурации
├── package.json              # Зависимости и скрипты
├── tsconfig.json             # Конфигурация TypeScript
├── vite.config.ts            # Конфигурация Vite
└── index.html                # HTML точка входа

```

## Тестирование компонента

### Структура Mock данных

Mock данные создают следующую иерархию:

```
Уровень 1 (корень):
├── 1 (node)
│   ├── 11 (node)
│   │   ├── 111 (leaf)
│   │   │   ├── 1111 (account)
│   │   │   └── 1112 (account)
│   │   └── 112 (leaf)
│   │       └── 1121 (account)
│   └── 12 (leaf)
│       ├── 121 (account)
│       └── 122 (account)
├── 2 (node)
│   ├── 21 (leaf)
│   └── 22 (node)
│       └── 221 (leaf)
│           ├── 2211 (account)
│           ├── 2212 (account)
│           └── 2213 (account)
└── 3 (leaf)
    ├── 31 (account)
    ├── 32 (account)
    └── 33 (account)
```

### Как тестировать

1. **Запустите dev сервер** с mock данными:
   ```bash
   npm run dev
   ```

2. **Проверьте prefetching**:
   - Наведите курсор на узел (не account)
   - Откройте Network в DevTools
   - Вы увидите, что данные предзагружаются

3. **Проверьте раскрытие узлов**:
   - Кликните на узел типа `node` или `leaf`
   - Узел раскроется и покажет дочерние элементы
   - Повторный клик закроет узел

4. **Проверьте конечные элементы**:
   - Элементы типа `account` не раскрываются
   - У них нет иконки раскрытия

## Работа с реальным API

### Формат API запросов

#### Получение корневого уровня
```
GET https://your-api/account?depth=1
```

Ответ:
```json
{
  "count": 3,
  "data": [
    { "id": 1, "type": "node", "path": "1", "depth": 1 },
    { "id": 2, "type": "leaf", "path": "2", "depth": 1 },
    { "id": 3, "type": "account", "path": "3", "depth": 1 }
  ]
}
```

#### Получение дочерних элементов
```
GET https://your-api/account?depth=2&path_part=1/
```

Ответ:
```json
{
  "count": 2,
  "data": [
    { "id": 11, "type": "node", "path": "1/11", "depth": 2 },
    { "id": 12, "type": "leaf", "path": "1/12", "depth": 2 }
  ]
}
```

### Обработка ошибок

API должен возвращать:
- **200 OK** - успешный запрос
- **404 Not Found** - данные не найдены
- **500 Internal Server Error** - ошибка сервера

Компонент обрабатывает все типы ошибок и отображает соответствующие сообщения.

## Кастомизация

### Изменение стилей

Отредактируйте `src/index.css`:

```css
/* Цвета типов узлов */
.node-type-node {
  background-color: #e6f7ff;  /* Голубой */
  color: #1890ff;
}

.node-type-leaf {
  background-color: #f6ffed;  /* Зеленый */
  color: #52c41a;
}

.node-type-account {
  background-color: #fff7e6;  /* Оранжевый */
  color: #fa8c16;
}
```

### Добавление новых колонок

В `src/components/TreeTableTanStack.tsx`:

```typescript
const columns = useMemo<ColumnDef<TreeNode>[]>(
  () => [
    // ... существующие колонки
    {
      accessorKey: 'yourField',
      header: 'Ваш заголовок',
      cell: ({ row }) => {
        // Кастомная логика отрисовки
        return <div>{row.original.yourField}</div>;
      },
    },
  ],
  [isExpanded]
);
```

### Изменение настроек кэширования

В `src/hooks/useTreeData.ts`:

```typescript
staleTime: 5 * 60 * 1000,  // Время актуальности данных (5 минут)
gcTime: 10 * 60 * 1000,    // Время хранения в кэше (10 минут)
```

## Производительность

### Оптимизации

1. **React.memo** - компоненты мемоизированы для предотвращения лишних ре-рендеров
2. **useMemo** - кэширование вычисляемых значений (колонки, видимые узлы)
3. **useCallback** - стабильные обработчики событий
4. **Set вместо Array** - O(1) операции для expandedPaths
5. **React Query кэширование** - автоматическое кэширование запросов

### Мониторинг

Используйте React DevTools Profiler для анализа производительности:
```bash
npm install -g react-devtools
react-devtools
```

## Отладка

### Логирование

В режиме mock данных в консоли будут видны логи запросов:
```
[MOCK MODE] Fetching mock data: { depth: 1, path_part: undefined }
```

### React Query DevTools

Добавьте DevTools для мониторинга запросов (опционально):

```bash
npm install @tanstack/react-query-devtools
```

В `App.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Troubleshooting

### Проблема: Компонент не отображается

**Решение:**
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что установлены все зависимости: `npm install`
3. Проверьте, что dev сервер запущен: `npm run dev`

### Проблема: API запросы не работают

**Решение:**
1. Проверьте `.env` файл и URL API
2. Включите режим mock данных для тестирования: `VITE_USE_MOCK_DATA=true`
3. Проверьте Network в DevTools на наличие ошибок CORS

### Проблема: Узлы не раскрываются

**Решение:**
1. Проверьте, что API возвращает правильный формат данных
2. Убедитесь, что поле `type` установлено корректно
3. Элементы типа `account` не раскрываются по дизайну

## Полезные команды

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр production сборки
npm run preview

# Проверка типов TypeScript
npx tsc --noEmit

# Форматирование кода (если используете Prettier)
npx prettier --write .
```

## Дополнительные ресурсы

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Vite Documentation](https://vitejs.dev)
