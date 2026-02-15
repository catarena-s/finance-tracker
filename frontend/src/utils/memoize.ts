/**
 * Простая функция мемоизации для дорогих вычислений
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Мемоизация с ограничением размера кэша (LRU)
 */
export function memoizeWithLimit<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  const keys: string[] = [];

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      // Перемещаем ключ в конец (most recently used)
      const index = keys.indexOf(key);
      if (index > -1) {
        keys.splice(index, 1);
        keys.push(key);
      }
      return cache.get(key)!;
    }

    const result = fn(...args);
    
    // Если достигнут лимит, удаляем самый старый элемент
    if (cache.size >= limit) {
      const oldestKey = keys.shift();
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, result);
    keys.push(key);
    
    return result;
  }) as T;
}
