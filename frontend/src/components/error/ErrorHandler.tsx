'use client';

import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { Toast } from '@/components/ui/Toast';

interface ErrorContextValue {
  showError: (message: string, retry?: () => void) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorState {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  retry?: () => void;
}

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<ErrorState | null>(null);

  const showError = useCallback((message: string, retry?: () => void) => {
    setError({ message, type: 'error', retry });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setError({ message, type: 'success' });
  }, []);

  const showWarning = useCallback((message: string) => {
    setError({ message, type: 'warning' });
  }, []);

  const showInfo = useCallback((message: string) => {
    setError({ message, type: 'info' });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleRetry = () => {
    if (error?.retry) {
      error.retry();
      clearError();
    }
  };

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, showWarning, showInfo, clearError }}>
      {children}
      {error && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <Toast
            message={error.message}
            type={error.type}
            onClose={clearError}
          />
          {error.retry && error.type === 'error' && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-lg"
            >
              Повторить
            </button>
          )}
        </div>
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

/**
 * Преобразует ошибки API в понятные пользователю сообщения
 */
export function getErrorMessage(error: any): string {
  // Сетевые ошибки
  if (!error.response) {
    return 'Ошибка подключения к серверу. Проверьте интернет-соединение.';
  }

  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  // HTTP статусы
  switch (status) {
    case 400:
      return message || 'Неверные данные. Проверьте введенную информацию.';
    case 401:
      return 'Требуется авторизация. Пожалуйста, войдите в систему.';
    case 403:
      return 'Доступ запрещен. У вас нет прав для выполнения этого действия.';
    case 404:
      return 'Запрашиваемый ресурс не найден.';
    case 409:
      return message || 'Конфликт данных. Возможно, запись уже существует.';
    case 422:
      return message || 'Ошибка валидации данных.';
    case 500:
      return 'Внутренняя ошибка сервера. Попробуйте позже.';
    case 503:
      return 'Сервис временно недоступен. Попробуйте позже.';
    default:
      return message || 'Произошла неизвестная ошибка. Попробуйте еще раз.';
  }
}
