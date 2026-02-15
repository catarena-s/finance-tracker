import { useEffect, useRef } from 'react';

/**
 * Хук для предзагрузки данных следующей страницы
 */
export function usePrefetch<T>(
  currentPage: number,
  totalPages: number,
  fetchFn: (page: number) => Promise<T>
) {
  const prefetchedPages = useRef<Set<number>>(new Set());

  useEffect(() => {
    const nextPage = currentPage + 1;
    
    // Предзагружаем следующую страницу, если она существует и еще не загружена
    if (nextPage <= totalPages && !prefetchedPages.current.has(nextPage)) {
      const timer = setTimeout(() => {
        fetchFn(nextPage)
          .then(() => {
            prefetchedPages.current.add(nextPage);
          })
          .catch(() => {
            // Игнорируем ошибки предзагрузки
          });
      }, 500); // Задержка для избежания лишних запросов

      return () => clearTimeout(timer);
    }
  }, [currentPage, totalPages, fetchFn]);
}
