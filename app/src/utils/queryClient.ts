import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 30000,
      gcTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 0,
    },
  },
});
