import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.response?.status === 401) {
            return 'Session expired. Please login again.';
        }
        if (error.response?.status === 404) {
            return 'Not found.';
        }
        if (error.response?.status === 500) {
            return 'Server error. Please try again.';
        }
        if (!error.response) {
            return 'No internet connection.';
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Something went wrong.';
}
