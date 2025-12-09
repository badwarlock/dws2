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
      <div style={{ padding: '20px' }}>
        <h1>Tree Table Component</h1>
        <TreeTableTanStack />
      </div>
    </QueryClientProvider>
  );
}

export default App;
