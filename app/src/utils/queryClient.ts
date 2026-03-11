import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof AxiosError) {
                    if (error.response?.status === 401) return false;
                    if (error.response?.status === 404) return false;
                }
                return failureCount < 2;
            },
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
            retry: 0,
        },
    },
});
