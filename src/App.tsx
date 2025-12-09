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
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <h1>Tree Table Component</h1>
        <p className="page-description">
          Иерархическое дерево с lazy loading и prefetching. Наведите курсор для предзагрузки, кликните для раскрытия узлов.
        </p>
        <TreeTableTanStack />
      </div>
    </QueryClientProvider>
  );
}

export default App;
