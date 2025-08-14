import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Создаем клиент React Query с настройками по умолчанию
const defaultQueryFn = async ({ queryKey }) => {
  const [endpoint, ...params] = queryKey;
  
  try {
    const response = await fetch(`/api/${endpoint}/${params.join('/')}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }) => {
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={devtoolsOpen}
          position="bottom-right"
          toggleButtonProps={{
            onClick: () => setDevtoolsOpen(!devtoolsOpen),
          }}
        />
      )}
    </QueryClientProvider>
  );
};

export default queryClient;