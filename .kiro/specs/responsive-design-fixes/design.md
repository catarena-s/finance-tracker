# Документ дизайна: Исправление адаптивности дизайна

## Обзор

Данный документ описывает технический дизайн для исправления проблем с адаптивностью пользовательского интерфейса приложения для управления финансами. Решение основано на использовании Tailwind CSS с адаптивными утилитами, CSS Grid и Flexbox для создания гибкого layout, а также оптимизации компонентов для мобильных устройств.

### Цели

1. Обеспечить корректное отображение всех компонентов на экранах шириной от 320px до 1440px и выше
2. Улучшить пользовательский опыт на мобильных устройствах и планшетах
3. Сохранить производительность и плавность работы интерфейса
4. Обеспечить доступность интерактивных элементов на сенсорных экранах
5. Создать систему тестирования адаптивности для предотвращения регрессий

### Ограничения

- Использование существующей системы дизайна на базе Tailwind CSS
- Сохранение текущей архитектуры компонентов (React + Next.js)
- Поддержка браузеров: Chrome, Firefox, Safari, Edge (последние 2 версии)
- Минимальная поддерживаемая ширина экрана: 320px

## Архитектура

### Система брейкпоинтов

Приложение использует стандартные брейкпоинты Tailwind CSS:

```typescript
const breakpoints = {
  sm: '640px',   // Мобильные устройства (landscape) и маленькие планшеты
  md: '768px',   // Планшеты
  lg: '1024px',  // Маленькие ноутбуки
  xl: '1280px',  // Десктопы
  '2xl': '1440px' // Большие экраны
}
```

### Стратегия адаптивности

1. **Mobile-first подход**: Базовые стили для мобильных устройств, затем расширение для больших экранов
2. **Fluid typography**: Использование относительных единиц (rem, em) для текста
3. **Flexible layouts**: CSS Grid и Flexbox для адаптивных раскладок
4. **Responsive images**: Оптимизация изображений и иконок для разных плотностей пикселей
5. **Touch-friendly**: Минимальные размеры интерактивных элементов 44x44px (рекомендация WCAG)

### Компоненты для модификации

1. **BalanceCards** - карточки с балансом на дашборде
2. **TrendChart** - график трендов доходов и расходов
3. **TopCategoriesWidget** - виджет топ категорий
4. **Modal** - модальные окна
5. **CategoryCard** - карточки категорий
6. **Dashboard page** - страница дашборда с фильтрами
7. **Navigation** - навигационное меню
8. **Transaction list** - список транзакций

## Компоненты и интерфейсы

### 1. Утилиты для работы с брейкпоинтами

```typescript
// src/hooks/useBreakpoint.ts
interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

interface UseBreakpointReturn {
  isMobile: boolean;      // < 640px
  isTablet: boolean;      // >= 640px && < 1024px
  isDesktop: boolean;     // >= 1024px
  currentBreakpoint: keyof BreakpointConfig | 'xs';
  width: number;
}

function useBreakpoint(): UseBreakpointReturn
```

Хук `useBreakpoint` использует существующий `useWindowSize` и предоставляет удобный API для определения текущего брейкпоинта.

### 2. Адаптивный компонент BalanceCards

```typescript
// src/components/dashboard/BalanceCards.tsx
interface BalanceCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  displayCurrency?: string;
  byCurrency?: SummaryByCurrency[];
  currencyRates?: Record<string, number>;
  loading?: boolean;
}
```

**Изменения:**
- Использование `grid-cols-1 md:grid-cols-3` для адаптивной сетки
- Адаптивные отступы: `p-4 sm:p-6 md:p-8`
- Адаптивные размеры шрифтов: `text-2xl sm:text-3xl md:text-4xl`
- Уменьшение размера иконок на мобильных: `h-10 w-10 sm:h-12 sm:w-12`
- Адаптивное отображение информации о валютах с горизонтальной прокруткой при необходимости

### 3. Адаптивные графики

```typescript
// src/components/dashboard/TrendChart.tsx
// src/components/dashboard/TopCategoriesWidget.tsx

interface ResponsiveChartConfig {
  height: {
    mobile: number;    // 256px
    tablet: number;    // 320px
    desktop: number;   // 384px
  };
  maxTicksLimit: {
    mobile: number;    // 5
    tablet: number;    // 8
    desktop: number;   // 12
  };
}
```

**Изменения:**
- Динамическая высота графиков: `h-64 sm:h-80 lg:h-96`
- Адаптивное количество меток на осях через `maxTicksLimit`
- Уменьшение размера точек на графиках для мобильных устройств
- Оптимизация tooltip для сенсорных экранов

### 4. Адаптивные фильтры дашборда

```typescript
// src/app/dashboard/page.tsx

interface FilterControlsProps {
  period: DashboardPeriod;
  startDate: string;
  endDate: string;
  onPeriodChange: (period: DashboardPeriod) => void;
  onDateChange: (start: string, end: string) => void;
}
```

**Изменения:**
- Вертикальное расположение на мобильных: `flex-col sm:flex-row`
- Адаптивные кнопки периодов: полный текст на desktop, сокращенный на mobile
- Минимальная ширина полей дат: `min-w-[120px]`
- Увеличенная область касания кнопок: `min-h-[44px] min-w-[44px]`

### 5. Адаптивные модальные окна

```typescript
// src/components/ui/Modal.tsx

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const responsiveSizeClasses = {
  sm: 'w-[95%] sm:max-w-md',
  md: 'w-[95%] sm:max-w-lg',
  lg: 'w-[95%] sm:max-w-2xl',
  xl: 'w-[95%] sm:max-w-4xl',
};
```

**Изменения:**
- Ширина 95% на мобильных, фиксированная max-width на desktop
- Вертикальное расположение полей формы на мобильных
- Увеличенная кнопка закрытия: `h-11 w-11` (44x44px)
- Прокрутка содержимого: `overflow-y-auto max-h-[85vh]`

### 6. Адаптивные карточки категорий

```typescript
// src/components/categories/CategoryCard.tsx

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}
```

**Изменения:**
- Адаптивная сетка: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Обрезка длинных названий: `truncate`
- Увеличенные кнопки действий на мобильных: `h-9 w-9` (36x36px)
- Всегда видимые кнопки на мобильных (без hover)

### 7. Адаптивный список транзакций

```typescript
// src/components/transactions/TransactionList.tsx

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Новый компонент:**
- `TransactionCard` - карточное представление для мобильных устройств
- Условный рендеринг: таблица на desktop, карточки на mobile
- Обрезка описаний: `line-clamp-2`

## Модели данных

### ResponsiveConfig

```typescript
interface ResponsiveConfig {
  breakpoints: BreakpointConfig;
  touchTargetSize: {
    minimum: number;      // 44px (WCAG AAA)
    comfortable: number;  // 48px
  };
  spacing: {
    mobile: {
      container: string;  // 'px-4'
      card: string;       // 'p-4'
      gap: string;        // 'gap-4'
    };
    tablet: {
      container: string;  // 'sm:px-6'
      card: string;       // 'sm:p-6'
      gap: string;        // 'sm:gap-6'
    };
    desktop: {
      container: string;  // 'lg:px-8'
      card: string;       // 'lg:p-8'
      gap: string;        // 'lg:gap-8'
    };
  };
  typography: {
    heading: {
      mobile: string;     // 'text-2xl'
      desktop: string;    // 'md:text-3xl'
    };
    body: {
      mobile: string;     // 'text-sm'
      desktop: string;    // 'md:text-base'
    };
  };
}
```

### ChartResponsiveConfig

```typescript
interface ChartResponsiveConfig {
  height: Record<'mobile' | 'tablet' | 'desktop', number>;
  maxTicksLimit: Record<'mobile' | 'tablet' | 'desktop', number>;
  pointRadius: Record<'mobile' | 'tablet' | 'desktop', number>;
  fontSize: Record<'mobile' | 'tablet' | 'desktop', number>;
}
```

## Свойства корректности

*Свойство - это характеристика или поведение, которое должно выполняться для всех допустимых выполнений системы - по сути, формальное утверждение о том, что должна делать система. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

### Рефлексия над свойствами

После анализа всех критериев приемки, я выявил следующие группы свойств, которые можно объединить:

1. **Свойства layout** (1.1, 3.1, 5.1, 8.1) - все проверяют изменение раскладки при определенной ширине viewport. Можно объединить в одно свойство "Адаптивная раскладка компонентов".

2. **Свойства минимальных размеров** (1.4, 2.2, 2.4, 4.5, 5.4, 7.2, 9.3) - все проверяют минимальные размеры элементов. Можно объединить в одно свойство "Минимальные размеры интерактивных элементов".

3. **Свойства text-overflow** (5.2, 8.3) - оба проверяют обрезку текста с многоточием. Можно объединить в одно свойство "Обрезка длинного текста".

4. **Свойства пропорций** (1.5, 5.5) - проверяют сохранение пропорций иконок. Можно объединить.

После объединения избыточных свойств, получаем следующий список уникальных свойств:

### Свойство 1: Адаптивная раскладка компонентов

*Для любого* компонента с grid или flex layout (карточки баланса, графики, карточки категорий, список транзакций), при ширине viewport меньше соответствующего брейкпоинта, компонент должен переключаться на вертикальную раскладку (одна колонка).

**Валидирует: Требования 1.1, 3.1, 5.1, 8.1**

### Свойство 2: Адаптивные размеры шрифтов

*Для любого* текстового элемента с адаптивными классами Tailwind, размер шрифта должен уменьшаться на мобильных устройствах и увеличиваться на desktop.

**Валидирует: Требования 1.2, 6.1**

### Свойство 3: Минимальные отступы контейнеров

*Для любого* контейнера на странице, при ширине viewport в диапазоне 320px-480px, должны быть обеспечены минимальные отступы 16px (1rem) по краям.

**Валидирует: Требования 1.4, 6.3**

### Свойство 4: Сохранение пропорций иконок

*Для любой* иконки в компонентах, соотношение ширины к высоте должно оставаться 1:1 на всех размерах экрана.

**Валидирует: Требования 1.5, 5.5**

### Свойство 5: Вертикальное расположение фильтров

*Для любого* набора элементов управления фильтрами, при ширине viewport менее 640px, элементы должны располагаться вертикально (flex-direction: column).

**Валидирует: Требования 2.1, 6.2**

### Свойство 6: Минимальные размеры интерактивных элементов

*Для любого* интерактивного элемента (кнопка, ссылка, input), минимальный размер области касания должен быть 44x44px на всех устройствах.

**Валидирует: Требования 2.4, 4.5, 5.4, 7.2, 9.3**

### Свойство 7: Адаптивные метки кнопок

*Для любой* кнопки с длинным текстом, при ширине viewport менее 640px, должен отображаться сокращенный вариант текста.

**Валидирует: Требования 2.5**

### Свойство 8: Минимальная высота графиков

*Для любого* графика Chart.js, при отображении на мобильном устройстве (viewport < 640px), высота контейнера должна быть минимум 256px.

**Валидирует: Требования 3.2**

### Свойство 9: Адаптивное количество меток на осях

*Для любого* графика с более чем 10 точками данных, при ширине viewport менее 768px, количество меток на оси X должно быть ограничено до 5.

**Валидирует: Требования 3.4**

### Свойство 10: Ширина модальных окон

*Для любого* модального окна, при ширине viewport менее 640px, ширина окна должна составлять 95% от ширины viewport.

**Валидирует: Требования 4.1**

### Свойство 11: Прокрутка содержимого модальных окон

*Для любого* модального окна с содержимым, превышающим высоту viewport, должна быть доступна вертикальная прокрутка (overflow-y: auto).

**Валидирует: Требования 4.2**

### Свойство 12: Вертикальное расположение полей формы

*Для любой* формы в модальном окне, при ширине viewport менее 640px, поля должны располагаться вертикально в одну колонку.

**Валидирует: Требования 4.3**

### Свойство 13: Обрезка длинного текста

*Для любого* текстового элемента с ограниченной шириной (название категории, описание транзакции), при превышении доступной ширины, текст должен обрезаться с многоточием (text-overflow: ellipsis).

**Валидирует: Требования 5.2, 8.3**

### Свойство 14: Отображение всех ключевых данных в карточках

*Для любой* транзакции, отображаемой в виде карточки на мобильном устройстве, должны присутствовать все ключевые поля: дата, категория, сумма, описание.

**Валидирует: Требования 8.2**

### Свойство 15: Отсутствие горизонтальной прокрутки

*Для любой* страницы приложения, при любой ширине viewport от 320px до 1440px, не должно возникать горизонтальной прокрутки (overflow-x: hidden на body).

**Валидирует: Требования 9.2**

### Свойство 16: Оптимизация точек данных графиков

*Для любого* графика с более чем 50 точками данных, при отображении на мобильном устройстве (viewport < 640px), количество отображаемых точек должно быть уменьшено через sampling или агрегацию.

**Валидирует: Требования 10.2**

### Свойство 17: Использование CSS-трансформаций для анимаций

*Для любой* CSS-анимации в приложении, должны использоваться свойства transform и opacity вместо layout-свойств (width, height, top, left).

**Валидирует: Требования 10.3**

## Обработка ошибок

### Сценарии ошибок

1. **Viewport слишком узкий (< 320px)**
   - Отображать предупреждение пользователю о минимальной поддерживаемой ширине
   - Применять стили для 320px как fallback

2. **JavaScript отключен**
   - Базовая адаптивность через CSS media queries должна работать
   - Графики не будут отображаться (graceful degradation)

3. **Старые браузеры без поддержки CSS Grid**
   - Fallback на Flexbox через @supports
   - Использование autoprefixer для совместимости

4. **Медленное соединение**
   - Показывать skeleton loaders для графиков
   - Lazy loading для компонентов ниже fold

### Обработка edge cases

```typescript
// Проверка минимальной ширины viewport
function useViewportWarning() {
  const { width } = useWindowSize();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(width > 0 && width < 320);
  }, [width]);

  return showWarning;
}

// Fallback для CSS Grid
@supports not (display: grid) {
  .grid-container {
    display: flex;
    flex-wrap: wrap;
  }
}
```

## Стратегия тестирования

### Двойной подход к тестированию

Для обеспечения корректности адаптивности используется комбинация unit-тестов и property-based тестов:

- **Unit-тесты**: Проверяют конкретные примеры, edge cases и условия ошибок
- **Property-тесты**: Проверяют универсальные свойства на множестве входных данных

Оба типа тестов дополняют друг друга и необходимы для полного покрытия.

### Unit-тестирование

**Инструменты:**
- Jest + React Testing Library для компонентов
- @testing-library/user-event для симуляции взаимодействий
- jest-axe для тестирования доступности

**Примеры unit-тестов:**

```typescript
describe('BalanceCards responsive behavior', () => {
  it('should display cards in single column on mobile', () => {
    // Конкретный пример: viewport 375px
    global.innerWidth = 375;
    const { container } = render(<BalanceCards {...props} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
  });

  it('should display cards in three columns on desktop', () => {
    // Конкретный пример: viewport 1024px
    global.innerWidth = 1024;
    const { container } = render(<BalanceCards {...props} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('md:grid-cols-3');
  });

  it('should handle empty currency data gracefully', () => {
    // Edge case: нет данных о валютах
    const { queryByText } = render(
      <BalanceCards {...props} byCurrency={[]} />
    );
    expect(queryByText(/Курсы валют/)).not.toBeInTheDocument();
  });
});
```

### Property-Based тестирование

**Библиотека:** fast-check (для TypeScript/JavaScript)

**Конфигурация:**
- Минимум 100 итераций на каждый property-тест
- Каждый тест должен ссылаться на свойство из документа дизайна
- Формат тега: `Feature: responsive-design-fixes, Property {number}: {property_text}`

**Примеры property-тестов:**

```typescript
import fc from 'fast-check';

describe('Property: Adaptive component layout', () => {
  // Feature: responsive-design-fixes, Property 1: Адаптивная раскладка компонентов
  it('should switch to vertical layout below breakpoint for any component', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // viewport width
        fc.array(fc.record({ /* balance card data */ }), { minLength: 1, maxLength: 10 }),
        (viewportWidth, cardData) => {
          global.innerWidth = viewportWidth;
          const { container } = render(<BalanceCards data={cardData} />);
          const grid = container.querySelector('.grid');
          
          // Проверяем, что используется одна колонка
          const computedStyle = window.getComputedStyle(grid);
          const columns = computedStyle.gridTemplateColumns.split(' ').length;
          expect(columns).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property: Minimum interactive element sizes', () => {
  // Feature: responsive-design-fixes, Property 6: Минимальные размеры интерактивных элементов
  it('should ensure all interactive elements are at least 44x44px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1440 }), // viewport width
        fc.constantFrom('button', 'a', 'input[type="button"]'), // element types
        (viewportWidth, elementType) => {
          global.innerWidth = viewportWidth;
          const { container } = render(<DashboardPage />);
          const interactiveElements = container.querySelectorAll(elementType);
          
          interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            expect(rect.width).toBeGreaterThanOrEqual(44);
            expect(rect.height).toBeGreaterThanOrEqual(44);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property: No horizontal overflow', () => {
  // Feature: responsive-design-fixes, Property 15: Отсутствие горизонтальной прокрутки
  it('should not have horizontal overflow at any viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1440 }),
        (viewportWidth) => {
          global.innerWidth = viewportWidth;
          const { container } = render(<App />);
          
          const body = document.body;
          const html = document.documentElement;
          
          const bodyWidth = body.scrollWidth;
          const htmlWidth = html.scrollWidth;
          const viewportWidth = window.innerWidth;
          
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
          expect(htmlWidth).toBeLessThanOrEqual(viewportWidth);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Визуальное регрессионное тестирование

**Инструменты:**
- Playwright для E2E тестов
- Percy или Chromatic для визуальных снимков

**Тестовые сценарии:**
1. Снимки дашборда на всех брейкпоинтах (320px, 375px, 768px, 1024px, 1440px)
2. Снимки модальных окон на мобильных и desktop
3. Снимки списка транзакций в табличном и карточном виде
4. Снимки графиков с различным количеством данных

### Тестирование производительности

**Метрики:**
- First Contentful Paint (FCP) < 1.8s на 3G
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms

**Инструменты:**
- Lighthouse CI для автоматических проверок
- WebPageTest для детального анализа

### Тестирование доступности

**Проверки:**
- Минимальный размер touch targets (44x44px)
- Контрастность текста (WCAG AA: 4.5:1)
- Keyboard navigation на всех устройствах
- Screen reader compatibility

**Инструменты:**
- jest-axe для автоматических проверок
- Ручное тестирование с VoiceOver/TalkBack

## Примечания по реализации

### Приоритеты

1. **Высокий приоритет:**
   - Исправление карточек баланса и фильтров на дашборде
   - Адаптация модальных окон
   - Минимальные размеры интерактивных элементов

2. **Средний приоритет:**
   - Адаптация графиков
   - Карточное представление транзакций
   - Оптимизация производительности

3. **Низкий приоритет:**
   - Визуальные улучшения
   - Дополнительные анимации
   - Расширенная поддержка старых браузеров

### Миграционная стратегия

1. Создать новые адаптивные компоненты параллельно со старыми
2. Постепенно заменять старые компоненты новыми
3. Использовать feature flags для A/B тестирования
4. Собирать метрики производительности и UX

### Документация

Все брейкпоинты и правила адаптивности должны быть задокументированы в:
- Комментариях в коде компонентов
- Storybook stories с примерами на разных размерах экрана
- README.md с руководством по адаптивному дизайну
