import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Создает и настраивает экземпляр Axios
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Можно добавить токен аутентификации здесь
      // const token = localStorage.getItem('token');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const apiError = handleApiError(error);

      // Retry logic for network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        const config = error.config as AxiosRequestConfig & { _retry?: number };
        config._retry = (config._retry || 0) + 1;

        if (config._retry <= 3) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, config._retry!) * 1000)
          );
          return client.request(config);
        }
      }

      return Promise.reject(apiError);
    }
  );

  return client;
}

/**
 * Обрабатывает ошибки API и преобразует их в стандартный формат
 */
function handleApiError(error: AxiosError): ApiError {
  if (error.response) {
    // Сервер ответил с кодом ошибки
    const { status, data } = error.response;
    const errorData = data as any;

    switch (status) {
      case 400:
        return {
          message: errorData.message || 'Invalid request data',
          errors: errorData.errors,
          statusCode: 400,
        };
      case 401:
        return {
          message: 'Authentication required',
          statusCode: 401,
        };
      case 403:
        return {
          message: 'Access denied',
          statusCode: 403,
        };
      case 404:
        return {
          message: errorData.message || 'Resource not found',
          statusCode: 404,
        };
      case 422:
        return {
          message: errorData.message || 'Validation error',
          errors: errorData.errors,
          statusCode: 422,
        };
      case 500:
        return {
          message: 'Server error, please try again later',
          statusCode: 500,
        };
      default:
        return {
          message: errorData.message || 'An unexpected error occurred',
          statusCode: status,
        };
    }
  } else if (error.request) {
    // Запрос был отправлен, но ответа не получено
    return {
      message: 'Unable to connect to server',
      statusCode: 0,
    };
  } else {
    // Ошибка при настройке запроса
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 0,
    };
  }
}

// Создаем единственный экземпляр клиента
export const apiClient = createApiClient();
