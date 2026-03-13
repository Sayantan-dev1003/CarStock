import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || 'An error occurred';

      switch (status) {
        case 401:
          return 'Session expired. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Internal server error. Please try again later.';
        default:
          return message;
      }
    } else if (error.request) {
      return 'Network error. Please check your internet connection.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};
