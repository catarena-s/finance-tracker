# Руководство по адаптивному дизайну

Приложение использует mobile-first подход с адаптивным дизайном для корректного отображения на всех устройствах от 320px до 1440px и выше.

## Система брейкпоинтов

Проект использует стандартные брейкпоинты Tailwind CSS:

| Брейкпоинт | Ширина | Устройства |
|------------|--------|------------|
| `xs` (базовый) | < 640px | Мобильные устройства (portrait) |
| `sm` | ≥ 640px | Мобильные устройства (landscape), маленькие планшеты |
| `md` | ≥ 768px | Планшеты |
| `lg` | ≥ 1024px | Маленькие ноутбуки |
| `xl` | ≥ 1280px | Десктопы |
| `2xl` | ≥ 1440px | Большие экраны |

## Примеры использования адаптивных классов

### Адаптивная сетка
```tsx
// Одна колонка на мобильных, три на планшетах и выше
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <BalanceCard />
  <BalanceCard />
  <BalanceCard />
</div>
```

### Адаптивные отступы
```tsx
// Меньшие отступы на мобильных, больше на desktop
<div className="p-4 sm:p-6 lg:p-8">
  <Content />
</div>
```

### Адаптивная типографика
```tsx
// Меньший размер шрифта на мобильных
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Заголовок
</h1>
```

### Адаптивное направление flex
```tsx
// Вертикальное расположение на мобильных, горизонтальное на desktop
<div className="flex flex-col sm:flex-row gap-4">
  <FilterControl />
  <FilterControl />
</div>
```

### Условное отображение
```tsx
// Скрыть на мобильных, показать на desktop
<div className="hidden lg:block">
  <DetailedInfo />
</div>

// Показать только на мобильных
<div className="block lg:hidden">
  <MobileMenu />
</div>
```

## Правила для новых компонентов

При создании новых компонентов следуйте этим правилам:

### 1. Mobile-First подход
Всегда начинайте с мобильной версии, затем добавляйте стили для больших экранов:
```tsx
// ✅ Правильно
<div className="text-sm md:text-base lg:text-lg">

// ❌ Неправильно
<div className="text-lg md:text-sm">
```

### 2. Минимальные размеры интерактивных элементов
Все кнопки, ссылки и поля ввода должны иметь минимальную область касания 44x44px:
```tsx
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Кнопка
</button>
```

### 3. Адаптивные отступы контейнеров
Используйте минимум 16px (1rem) отступы на мобильных устройствах:
```tsx
<div className="px-4 sm:px-6 lg:px-8">
  <Container />
</div>
```

### 4. Адаптивные модальные окна
Модальные окна должны занимать 95% ширины на мобильных:
```tsx
<div className="w-[95%] sm:max-w-lg md:max-w-2xl">
  <Modal />
</div>
```

### 5. Вертикальные раскладки на мобильных
Формы и фильтры должны располагаться вертикально на узких экранах:
```tsx
<form className="flex flex-col sm:flex-row gap-4">
  <Input />
  <Input />
</form>
```

### 6. Адаптивные графики
Графики должны иметь минимальную высоту 256px на мобильных:
```tsx
<div className="h-64 sm:h-80 lg:h-96">
  <Chart />
</div>
```

### 7. Обрезка длинного текста
Используйте `truncate` или `line-clamp` для длинных текстов:
```tsx
// Одна строка с многоточием
<p className="truncate">Длинный текст...</p>

// Несколько строк с многоточием
<p className="line-clamp-2">Длинный текст...</p>
```

### 8. Тестирование адаптивности
Всегда тестируйте компоненты на следующих брейкпоинтах:
- 320px (минимальная ширина)
- 375px (iPhone SE)
- 768px (iPad portrait)
- 1024px (iPad landscape)
- 1440px (desktop)

### 9. Использование хука useBreakpoint
Для условной логики используйте хук `useBreakpoint`:
```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### 10. Производительность
- Используйте CSS-трансформации (`transform`, `opacity`) вместо layout-свойств для анимаций
- Оптимизируйте количество точек данных на графиках для мобильных устройств
- Избегайте горизонтальной прокрутки на всех брейкпоинтах

## Адаптивные компоненты

### BalanceCards
- **Сетка**: `grid-cols-1 md:grid-cols-3` - одна колонка на мобильных, три на планшетах
- **Отступы**: `p-4 sm:p-6 md:p-8` - увеличиваются с размером экрана
- **Шрифты**: `text-2xl sm:text-3xl md:text-4xl` - адаптивные размеры
- **Иконки**: `h-10 w-10 sm:h-12 sm:w-12` - меньше на мобильных

### Фильтры дашборда
- **Layout**: `flex-col sm:flex-row` - вертикально на мобильных
- **Кнопки**: `min-h-[44px] min-w-[44px]` - минимум 44x44px для touch
- **Метки**: Полные на desktop (День/Месяц/Год), сокращенные на мобильных (Д/М/Г)

### Графики (TrendChart, TopCategoriesWidget)
- **Высота**: `h-64 sm:h-80 lg:h-96` - 256px → 320px → 384px
- **Метки оси X**: 5 (mobile) → 8 (tablet) → 12 (desktop)
- **Размер точек**: 2px (mobile) → 3px (tablet) → 4px (desktop)
- **Оптимизация данных**: Максимум 20 точек на мобильных, 40 на планшетах

### Модальные окна
- **Ширина**: `w-[95%] sm:max-w-{size}` - 95% на мобильных, фиксированная на desktop
- **Прокрутка**: `overflow-y-auto max-h-[85vh]` - вертикальная прокрутка при необходимости
- **Формы**: `flex-col sm:flex-row` - вертикальные поля на мобильных

### Карточки категорий
- **Сетка**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Текст**: `truncate` - обрезка длинных названий
- **Кнопки действий**: Всегда видимы на мобильных, появляются при hover на desktop

### Список транзакций
- **Мобильные**: Карточки с `line-clamp-2` для описаний
- **Desktop**: Таблица с полной информацией
- **Переключение**: Автоматическое на основе `useBreakpoint`

## Утилиты и хуки

### useBreakpoint
Хук для определения текущего размера экрана:
```tsx
const { isMobile, isTablet, isDesktop, currentBreakpoint } = useBreakpoint();
```

### responsiveConfig
Конфигурация адаптивных параметров:
```tsx
import { getChartConfig, getChartHeightClasses } from '@/lib/responsiveConfig';

const chartConfig = getChartConfig(isMobile, isTablet);
// { maxTicksLimit: 5, pointRadius: 2, fontSize: 10 }
```

### chartDataOptimization
Оптимизация данных графиков:
```tsx
import { optimizeChartData } from '@/lib/chartDataOptimization';

const optimizedData = optimizeChartData(data, isMobile, isTablet);
// Уменьшает количество точек для лучшей производительности
```

## Тестирование адаптивности

### Property-Based тесты
Используйте fast-check для тестирования свойств на разных viewport:
```tsx
fc.assert(
  fc.property(
    fc.integer({ min: 320, max: 639 }), // Mobile viewport
    (viewportWidth) => {
      Object.defineProperty(window, "innerWidth", {
        value: viewportWidth,
      });
      // Тест адаптивного поведения
    }
  ),
  { numRuns: 50 }
);
```

### Unit тесты
Проверяйте наличие адаптивных классов:
```tsx
const element = container.querySelector('.flex-col');
expect(element).toHaveClass('sm:flex-row');
```

## Чеклист для новых компонентов

- [ ] Используется mobile-first подход
- [ ] Интерактивные элементы минимум 44x44px
- [ ] Минимальные отступы 16px на мобильных
- [ ] Адаптивные шрифты и отступы
- [ ] Вертикальные раскладки на узких экранах
- [ ] Обрезка длинного текста
- [ ] Протестировано на всех брейкпоинтах (320px, 375px, 768px, 1024px, 1440px)
- [ ] Используется хук useBreakpoint для условной логики
- [ ] Оптимизирована производительность (CSS transforms, оптимизация данных)
- [ ] Нет горизонтальной прокрутки
