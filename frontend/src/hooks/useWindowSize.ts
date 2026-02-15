import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Хук для отслеживания размера окна с debounce
 * @param delay - Задержка debounce в миллисекундах
 */
export function useWindowSize(delay: number = 150): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Используем debounce для оптимизации
  const debouncedSize = useDebounce(windowSize, delay);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    
    // Вызываем сразу для получения актуального размера
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return debouncedSize;
}
