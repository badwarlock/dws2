import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TreeTableTanStack } from './components/TreeTableTanStack';

// Создаем клиент React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Показываем статус режима в консоли
  console.log('[App] Environment variables:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
    MODE: import.meta.env.MODE,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <h1>Tree Table Component</h1>
        <p className="page-description">
          Иерархическое дерево с lazy loading и prefetching. Наведите курсор для предзагрузки, кликните для раскрытия узлов.
        </p>
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          background: '#e6f7ff',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#0958d9'
        }}>
          <strong>ℹ️ Режим:</strong> {import.meta.env.VITE_USE_MOCK_DATA !== 'false' ? 'Mock данные' : 'Реальный API'}
          {import.meta.env.VITE_USE_MOCK_DATA !== 'false' && (
            <span> • Откройте консоль браузера для просмотра логов</span>
          )}
        </div>
        <TreeTableTanStack />
      </div>
    </QueryClientProvider>
  );
}

export default App;
