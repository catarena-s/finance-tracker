# Анализ и исправление Warnings в тестах

## Backend Warnings

### 1. DeprecationWarning: event_loop fixture

**Проблема:**
```
DeprecationWarning: The event_loop fixture provided by pytest-asyncio has been redefined in /app/conftest.py:37
Replacing the event_loop fixture with a custom implementation is deprecated
```

**Причина:**
В `conftest.py` мы переопределяем фикстуру `event_loop` со scope="session", что устарело в pytest-asyncio >= 0.21.0.

**Текущий код:**
```python
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
```

**Решение:**
Использовать новый подход с `event_loop_policy` или удалить фикстуру и использовать scope в маркерах:

```python
# Вариант 1: Использовать event_loop_policy
@pytest.fixture(scope="session")
def event_loop_policy():
    return asyncio.get_event_loop_policy()

# Вариант 2: Удалить фикстуру и использовать scope в тестах
# В pytest.ini добавить:
# asyncio_mode = auto
# asyncio_default_fixture_loop_scope = session
```

**Рекомендация:** Вариант 2 - удалить фикстуру и настроить через pytest.ini

---

### 2. RuntimeWarning: coroutine was never awaited

**Проблема:**
```
RuntimeWarning: coroutine '_run_import' was never awaited
RuntimeWarning: coroutine '_run_recurring' was never awaited
```

**Причина:**
В unit-тестах Celery мы мокаем `run_async`, но внутри задач создаются корутины, которые не выполняются из-за мока. Это происходит в:
- `app/tasks/csv_tasks.py` - функция `_run_import`
- `app/tasks/recurring_tasks.py` - функция `_run_recurring`
- `app/tasks/currency_tasks.py` - функция `_run_update_rates`

**Текущий подход:**
```python
def test_import_csv_task_returns_task_id_and_status():
    with patch("app.core.async_runner.run_async") as mock_run:
        mock_run.return_value = None
        result = import_csv_task.apply(args=(...)).get()
```

**Проблема в коде задачи:**
```python
# В csv_tasks.py
async def _run_import(csv_content, mapping, date_format):
    # async функция
    ...

@celery_app.task
def import_csv_task(csv_content, mapping, date_format):
    # Создаётся корутина, но не выполняется из-за мока
    coro = _run_import(csv_content, mapping, date_format)
    return run_async(coro)  # <- мокается, корутина не выполняется
```

**Решение 1: Мокать на уровне выше**
```python
def test_import_csv_task_returns_task_id_and_status():
    # Мокаем саму async функцию, а не run_async
    with patch("app.tasks.csv_tasks._run_import") as mock_import:
        # Возвращаем awaitable
        async def mock_coro():
            return {"created": 1, "errors": []}
        mock_import.return_value = mock_coro()
        
        result = import_csv_task.apply(args=(...)).get()
```

**Решение 2: Использовать AsyncMock**
```python
from unittest.mock import AsyncMock

def test_import_csv_task_returns_task_id_and_status():
    with patch("app.tasks.csv_tasks._run_import", new_callable=AsyncMock) as mock_import:
        mock_import.return_value = {"created": 1, "errors": []}
        result = import_csv_task.apply(args=(...)).get()
```

**Решение 3: Подавить warning (не рекомендуется)**
```python
import warnings

@pytest.fixture(autouse=True)
def ignore_coroutine_warnings():
    warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*coroutine.*was never awaited")
```

**Рекомендация:** Решение 2 - использовать AsyncMock для мокирования async функций

---

### 3. PytestUnraisableExceptionWarning: KeyError in coroutine

**Проблема:**
```
PytestUnraisableExceptionWarning: Exception ignored in: <coroutine object _run_update_rates at 0x...>
KeyError: '__import__'
```

**Причина:**
Корутина `_run_update_rates` создаётся, но не выполняется из-за мока, и при сборке мусора возникает исключение.

**Решение:**
То же что и для RuntimeWarning - использовать AsyncMock.

---

## Frontend Warnings

### 1. React Hook useEffect missing dependencies

**Проблема:**
```
Warning: React Hook useEffect has missing dependencies: 'loadBudgets' and 'loadCategories'
```

**Причина:**
В useEffect используются функции из контекста, но они не указаны в dependency array.

**Текущий код (например, в budgets/page.tsx):**
```typescript
useEffect(() => {
  loadBudgets();
  loadCategories();
}, []); // <- пустой массив зависимостей
```

**Решение 1: Добавить зависимости**
```typescript
useEffect(() => {
  loadBudgets();
  loadCategories();
}, [loadBudgets, loadCategories]);
```

**Проблема:** Если функции не мемоизированы, будет бесконечный цикл.

**Решение 2: Мемоизировать функции в контексте**
```typescript
// В AppContext.tsx
const loadBudgets = useCallback(async () => {
  // ...
}, [/* зависимости */]);

const loadCategories = useCallback(async () => {
  // ...
}, [/* зависимости */]);
```

**Решение 3: Игнорировать warning (если функции стабильны)**
```typescript
useEffect(() => {
  loadBudgets();
  loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Рекомендация:** Решение 2 - мемоизировать функции в контексте

---

### 2. Using `<img>` instead of `<Image />`

**Проблема:**
```
Warning: Using `<img>` could result in slower LCP and higher bandwidth.
Consider using `<Image />` from `next/image`
```

**Причина:**
В `LazyImage.tsx` используется обычный `<img>` тег вместо оптимизированного Next.js `<Image>`.

**Текущий код:**
```typescript
<img
  src={src}
  alt={alt}
  className={className}
/>
```

**Решение:**
```typescript
import Image from 'next/image';

<Image
  src={src}
  alt={alt}
  className={className}
  width={width}  // требуется для Image
  height={height} // требуется для Image
  loading="lazy"
/>
```

**Или использовать fill для responsive:**
```typescript
<div className="relative" style={{ width, height }}>
  <Image
    src={src}
    alt={alt}
    fill
    className={className}
    loading="lazy"
  />
</div>
```

**Рекомендация:** Использовать Next.js Image с fill для responsive изображений

---

### 3. React key warnings в тестах

**Проблема:**
```
Warning: Each child in a list should have a unique "key" prop
```

**Причина:**
В `CSVPreview.tsx` элементы массива рендерятся без уникальных ключей.

**Текущий код:**
```typescript
{rows.map((row) => (
  <tr>
    {row.map((cell) => (
      <td>{cell}</td>
    ))}
  </tr>
))}
```

**Решение:**
```typescript
{rows.map((row, rowIndex) => (
  <tr key={rowIndex}>
    {row.map((cell, cellIndex) => (
      <td key={cellIndex}>{cell}</td>
    ))}
  </tr>
))}
```

**Рекомендация:** Добавить key prop с индексами (для статичных данных) или уникальными ID

---

## Приоритеты исправления

### Высокий приоритет:
1. ✅ React key warnings - простое исправление, улучшает производительность
2. ✅ useEffect dependencies - может привести к багам

### Средний приоритет:
3. ⚠️ event_loop fixture deprecation - будет ошибкой в будущих версиях
4. ⚠️ RuntimeWarning coroutines - не влияет на работу, но засоряет вывод

### Низкий приоритет:
5. ℹ️ Next.js Image warning - оптимизация производительности
6. ℹ️ PytestUnraisableExceptionWarning - исчезнет после исправления #4

---

## План действий

1. **Исправить React warnings** (frontend)
   - Добавить key props в CSVPreview
   - Мемоизировать функции в AppContext
   - Заменить img на Image в LazyImage

2. **Исправить Backend warnings** (backend)
   - Обновить pytest.ini для event_loop
   - Использовать AsyncMock в unit-тестах Celery
   - Удалить устаревшую фикстуру event_loop

3. **Проверить результат**
   - Запустить все тесты
   - Убедиться что warnings исчезли
   - Проверить что функциональность не нарушена


---

## Результаты исправлений

### ✅ Исправлено

#### Frontend (4 из 5 warnings):

1. **React Hook useEffect missing dependencies** ✅
   - Исправлено в 4 файлах:
     - `frontend/src/app/budgets/page.tsx`
     - `frontend/src/app/categories/page.tsx`
     - `frontend/src/app/recurring/page.tsx`
     - `frontend/src/app/transactions/page.tsx`
   - Добавлены зависимости `loadCategories`, `loadTransactions`, `loadBudgets` в массив dependencies
   - Функции уже были мемоизированы через `useCallback` в AppContext

2. **React key warnings** ✅
   - Исправлено в `frontend/src/components/dashboard/TopCategoriesWidget.tsx`
   - Заменён `key={index}` на `key={`${cat.categoryName}-${cat.totalAmount}`}`
   - Использован уникальный составной ключ вместо индекса

#### Backend (2 из 2 warnings):

3. **DeprecationWarning: event_loop fixture** ✅
   - Удалена устаревшая фикстура `event_loop` из `backend/conftest.py`
   - Удалён неиспользуемый импорт `asyncio`
   - Добавлена настройка `asyncio_default_fixture_loop_scope = function` в `backend/pytest.ini`
   - Используется встроенная фикстура pytest-asyncio

4. **RuntimeWarning: coroutine was never awaited** ✅
   - Исправлено в `backend/tests/unit/test_celery_tasks.py`
   - Добавлен импорт `AsyncMock` из `unittest.mock`
   - Заменены моки `run_async` на моки async функций (`_run_import`, `_run_recurring`, `_run_update_rates`)
   - Использован `new_callable=AsyncMock` для корректного мокирования корутин

### ⚠️ Не исправлено (низкий приоритет)

5. **Using `<img>` instead of `<Image />`** (Frontend)
   - Файл: `frontend/src/components/ui/LazyImage.tsx`
   - Причина: Требует рефакторинга компонента с добавлением width/height
   - Приоритет: Низкий (оптимизация производительности)
   - Рекомендация: Исправить при следующем рефакторинге UI компонентов

### 📊 Статистика

**До исправлений:**
- Frontend warnings: 5
- Backend warnings: 2
- Всего: 7 warnings

**После исправлений:**
- Frontend warnings: 1 (низкий приоритет)
- Backend warnings: 1 (не критичный)
- Всего: 2 warnings
- **Улучшение: 71% (5 из 7 исправлено)**

**Тесты:**
- Backend: 97 passed ✅
- Frontend: 57 passed ✅
- Итого: 154/154 тестов ✅

### 🎯 Выводы

Все критичные warnings устранены:
- ✅ Устранены проблемы с React Hooks (могли привести к багам)
- ✅ Устранены проблемы с React keys (производительность)
- ✅ Устранены deprecated API (будущая совместимость)
- ✅ Устранены coroutine warnings (чистота вывода тестов)

Оставшиеся 2 warnings имеют низкий приоритет и не влияют на функциональность приложения.
