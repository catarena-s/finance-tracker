# Документ проектирования: Frontend реализация

## Обзор

Frontend приложение - это современное, адаптивное веб-приложение, построенное на Next.js 14+ и TypeScript. Оно предоставляет комплексный пользовательский интерфейс для трекинга личных финансов, включая управление транзакциями, отслеживание бюджетов, организацию категорий и визуализацию финансовой аналитики.

Приложение следует компонентной архитектуре с четким разделением ответственности:
- **Слой представления**: React компоненты для отрисовки UI
- **Слой управления состоянием**: Context API для глобального состояния
- **Слой доступа к данным**: API клиенты для взаимодействия с backend
- **Утилитарный слой**: Вспомогательные функции для форматирования, валидации и трансформации данных

Дизайн акцентирует внимание на:
- Типобезопасности через TypeScript
- Адаптивном дизайне с Tailwind CSS
- Соответствии стандартам доступности (WCAG 2.1 AA)
- Оптимизации производительности (code splitting, lazy loading)
- Тестируемости через изолированные, чистые компоненты

## Архитектура

### Структура приложения

```
src/
├── app/                    # Next.js App Router страницы
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Страница Dashboard
│   ├── transactions/      # Страницы транзакций
│   ├── categories/        # Страницы категорий
│   └── budgets/           # Страницы бюджетов
├── components/            # React компоненты
│   ├── layout/           # Layout компоненты
│   ├── dashboard/        # Dashboard виджеты
│   ├── transactions/     # Компоненты транзакций
│   ├── categories/       # Компоненты категорий
│   ├── budgets/          # Компоненты бюджетов
│   └── common/           # Переиспользуемые UI компоненты
├── lib/                   # Основные библиотеки
│   ├── api/              # API клиенты
│   ├── context/          # React Context провайдеры
│   └── utils/            # Утилитарные функции
└── types/                 # TypeScript определения типов
```


### Поток данных

1. **Взаимодействие пользователя** → Обработчик события компонента
2. **Обработчик события** → Функция API клиента
3. **API клиент** → HTTP запрос к backend
4. **Ответ backend** → Обновление глобального состояния (Context)
5. **Обновление состояния** → Перерисовка компонента с новыми данными

## Компоненты и интерфейсы

### Layout компоненты

**Header компонент**
```typescript
interface HeaderProps {
  user?: {
    name: string;
    email: string;
  };
}

// Отображает логотип приложения, навигационные ссылки и меню пользователя
// Адаптивный: сворачивается в гамбургер-меню на мобильных устройствах
```

**Navigation компонент**
```typescript
interface NavigationProps {
  currentPath: string;
}

// Отрисовывает навигационное меню с подсветкой активного состояния
// Ссылки: Dashboard, Транзакции, Категории, Бюджеты
```

**Footer компонент**
```typescript
interface FooterProps {
  version: string;
}

// Отображает копирайт, версию и ссылки
```

### Dashboard компоненты

**SummaryCards компонент**
```typescript
interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currency: string;
}

// Отображает три карточки: Доходы, Расходы, Баланс
// Цветовое кодирование: зеленый для доходов, красный для расходов, синий для баланса
```

**ExpenseChart компонент**
```typescript
interface ExpenseChartProps {
  data: Array<{
    date: string;
    amount: number;
  }>;
  period: 'week' | 'month' | 'year';
}

// Линейный график, показывающий тренды расходов во времени
// Использует Chart.js для отрисовки
```

**TrendChart компонент**
```typescript
interface TrendChartProps {
  incomeData: Array<{ date: string; amount: number }>;
  expenseData: Array<{ date: string; amount: number }>;
  period: 'week' | 'month' | 'year';
}

// Двойной линейный график, сравнивающий доходы и расходы
```

**TopCategoriesWidget компонент**
```typescript
interface TopCategoriesWidgetProps {
  categories: Array<{
    id: string;
    name: string;
    totalAmount: number;
    percentage: number;
  }>;
  limit: number;
}

// Отображает топ категорий по расходам с гистограммой
```


### Компоненты транзакций

**TransactionList компонент**
```typescript
interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

// Отображает пагинированный список транзакций
// Поддерживает сортировку и фильтрацию
```

**TransactionCard компонент**
```typescript
interface TransactionCardProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

// Карточка отдельной транзакции
// Показывает иконку типа, сумму, категорию, дату, описание
```

**TransactionFilters компонент**
```typescript
interface TransactionFiltersProps {
  filters: {
    type?: 'income' | 'expense';
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  };
  categories: Array<{ id: string; name: string }>;
  onFilterChange: (filters: any) => void;
}

// Элементы управления фильтрами для списка транзакций
// Включает селектор типа, выпадающий список категорий, выбор диапазона дат
```

**TransactionForm компонент**
```typescript
interface TransactionFormProps {
  transaction?: Transaction;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

interface TransactionFormData {
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description: string;
  date: string;
}

// Форма для создания/редактирования транзакций
// Использует React Hook Form для валидации
// Валидирует: amount > 0, категория выбрана, дата валидна
```

### Компоненты категорий

**CategoryList компонент**
```typescript
interface CategoryListProps {
  categories: Category[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

// Сеточное отображение карточек категорий
// Группировка по типу (доход/расход)
```

**CategoryCard компонент**
```typescript
interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

// Карточка отдельной категории
// Показывает цветовой индикатор, иконку, название, тип
```

**CategoryForm компонент**
```typescript
interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

// Форма для создания/редактирования категорий
// Валидирует: имя не пустое, цвет валидный hex
```


### Компоненты бюджетов

**BudgetList компонент**
```typescript
interface BudgetListProps {
  budgets: Budget[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

// Список карточек бюджетов с прогресс-барами
// Показывает расходы vs лимит бюджета
```

**BudgetCard компонент**
```typescript
interface BudgetCardProps {
  budget: Budget;
  onEdit: () => void;
  onDelete: () => void;
}

// Карточка отдельного бюджета
// Прогресс-бар, показывающий соотношение потрачено/лимит
// Цветовое кодирование: зеленый (<70%), желтый (70-90%), красный (>90%)
```

**BudgetForm компонент**
```typescript
interface BudgetFormProps {
  budget?: Budget;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
}

interface BudgetFormData {
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

// Форма для создания/редактирования бюджетов
// Валидирует: amount > 0, даты валидны, end > start
```

### Общие компоненты

**Button компонент**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Переиспользуемая кнопка с вариантами и состояниями
// Показывает спиннер при загрузке
```

**Input компонент**
```typescript
interface InputProps {
  type: 'text' | 'number' | 'email' | 'password';
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Контролируемый input с label и отображением ошибок
// Доступный с правильными ARIA атрибутами
```

**Select компонент**
```typescript
interface SelectProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Выпадающий список с label и отображением ошибок
```

**Modal компонент**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Модальное окно с затемнением фона
// Закрывается при клике на фон или нажатии ESC
// Захватывает фокус внутри модального окна при открытии
```

**DatePicker компонент**
```typescript
interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  disabled?: boolean;
}

// Ввод даты с календарем
// Формат: YYYY-MM-DD
```

**CurrencyInput компонент**
```typescript
interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency: string;
  error?: string;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
}

// Специализированный input для денежных сумм
// Форматирует отображение с символом валюты
// Валидирует числовой ввод
```

**Pagination компонент**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
}

// Элементы управления пагинацией для списков
// Показывает номера страниц, кнопки назад/вперед
```


## Модели данных

### Определения типов Frontend

```typescript
// Типы транзакций
type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string; // Формат ISO 8601
  createdAt: string;
  updatedAt: string;
}

interface TransactionWithCategory extends Transaction {
  category: {
    id: string;
    name: string;
    color: string;
  };
}

// Типы категорий
interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string; // Hex код цвета
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// Типы бюджетов
type BudgetPeriod = 'monthly' | 'yearly';

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetWithDetails extends Budget {
  category: {
    id: string;
    name: string;
    color: string;
  };
  spent: number;
  remaining: number;
  percentageUsed: number;
}

// Типы аналитики
interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

interface TrendData {
  date: string;
  income: number;
  expense: number;
}

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

// Типы ответов API
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```


### Интерфейсы API клиентов

```typescript
// Transaction API
interface TransactionAPI {
  getAll(params: {
    page?: number;
    pageSize?: number;
    type?: TransactionType;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<TransactionWithCategory>>;
  
  getById(id: string): Promise<ApiResponse<TransactionWithCategory>>;
  
  create(data: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    description: string;
    date: string;
  }): Promise<ApiResponse<Transaction>>;
  
  update(id: string, data: Partial<Transaction>): Promise<ApiResponse<Transaction>>;
  
  delete(id: string): Promise<ApiResponse<void>>;
}

// Category API
interface CategoryAPI {
  getAll(type?: TransactionType): Promise<ApiResponse<Category[]>>;
  
  getById(id: string): Promise<ApiResponse<Category>>;
  
  create(data: {
    name: string;
    type: TransactionType;
    color: string;
    icon?: string;
  }): Promise<ApiResponse<Category>>;
  
  update(id: string, data: Partial<Category>): Promise<ApiResponse<Category>>;
  
  delete(id: string): Promise<ApiResponse<void>>;
}

// Budget API
interface BudgetAPI {
  getAll(): Promise<ApiResponse<BudgetWithDetails[]>>;
  
  getById(id: string): Promise<ApiResponse<BudgetWithDetails>>;
  
  create(data: {
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<Budget>>;
  
  update(id: string, data: Partial<Budget>): Promise<ApiResponse<Budget>>;
  
  delete(id: string): Promise<ApiResponse<void>>;
}

// Analytics API
interface AnalyticsAPI {
  getSummary(params: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<SummaryData>>;
  
  getTrends(params: {
    period: 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TrendData[]>>;
  
  getTopCategories(params: {
    limit: number;
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<CategorySpending[]>>;
}
```

### Управление состоянием

```typescript
// App Context
interface AppContextValue {
  // Транзакции
  transactions: TransactionWithCategory[];
  transactionsPagination: PaginationInfo;
  loadTransactions: (params?: TransactionFilters) => Promise<void>;
  createTransaction: (data: TransactionFormData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Категории
  categories: Category[];
  loadCategories: (type?: TransactionType) => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Бюджеты
  budgets: BudgetWithDetails[];
  loadBudgets: () => Promise<void>;
  createBudget: (data: BudgetFormData) => Promise<void>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Аналитика
  summary: SummaryData | null;
  trends: TrendData[];
  topCategories: CategorySpending[];
  loadSummary: (params?: DateRange) => Promise<void>;
  loadTrends: (period: 'week' | 'month' | 'year') => Promise<void>;
  loadTopCategories: (limit: number, type?: TransactionType) => Promise<void>;
  
  // Состояние UI
  loading: boolean;
  error: string | null;
  clearError: () => void;
}
```


## Свойства корректности

*Свойство - это характеристика или поведение, которое должно оставаться истинным во всех валидных выполнениях системы - по сути, формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинопроверяемыми гарантиями корректности.*

### Отправка и валидация форм

**Свойство 1: Валидная отправка формы создает сущность**
*Для любых* валидных данных формы (транзакция, категория или бюджет), отправка формы должна привести к созданию сущности и ее появлению в соответствующем списке со всеми отправленными данными, сохраненными.
**Валидирует: Требования 1.3, 7.8**

**Свойство 2: Невалидные данные формы показывают специфичные для полей ошибки**
*Для любой* формы с невалидными значениями полей (отрицательные суммы, пустые обязательные поля, невалидные даты, дублирующиеся имена), система должна отображать специфичные сообщения об ошибках для каждого невалидного поля и предотвращать отправку формы.
**Валидирует: Требования 1.4, 7.9**

### Фильтрация и запросы данных

**Свойство 3: Фильтр по типу возвращает только соответствующие транзакции**
*Для любого* списка транзакций и выбранного фильтра по типу, все отображаемые транзакции должны иметь тип, соответствующий выбранному фильтру.
**Валидирует: Требования 2.1**

**Свойство 4: Фильтр по категории возвращает только транзакции этой категории**
*Для любого* списка транзакций и выбранного фильтра по категории, все отображаемые транзакции должны иметь categoryId, соответствующий выбранной категории.
**Валидирует: Требования 2.2**

**Свойство 5: Фильтр по диапазону дат возвращает только транзакции в диапазоне**
*Для любого* списка транзакций и фильтра по диапазону дат (startDate, endDate), все отображаемые транзакции должны иметь даты, где startDate ≤ transaction.date ≤ endDate.
**Валидирует: Требования 2.3**

### Форматирование данных

**Свойство 6: Денежные суммы форматируются консистентно**
*Для любой* числовой суммы, отображаемой в UI, она должна быть отформатирована с символом валюты, разделителями тысяч и ровно 2 десятичными знаками.
**Валидирует: Требования 6.1**

**Свойство 7: Даты форматируются консистентно**
*Для любой* даты, отображаемой в UI, она должна быть отформатирована с использованием одного и того же паттерна формата дат во всем приложении.
**Валидирует: Требования 6.2**

### Расчеты бюджета

**Свойство 8: Предупреждения бюджета появляются при превышении**
*Для любого* бюджета, где потраченная сумма превышает 70% лимита бюджета, UI должен отображать индикатор предупреждения (желтый цвет для 70-90%, красный для >90%).
**Валидирует: Требования 4.5**

**Свойство 9: Процент бюджета рассчитывается корректно**
*Для любого* бюджета с потраченной суммой и лимитом, отображаемый процент должен равняться (spent / limit) × 100, округленному до 1 десятичного знака.
**Валидирует: Требования 4.8**

### Обработка ошибок и состояния загрузки

**Свойство 10: Ошибки API отображают понятные пользователю сообщения**
*Для любого* неудавшегося API запроса, UI должен отображать сообщение об ошибке, понятное пользователю (без технических stack traces) и описывающее, что пошло не так.
**Валидирует: Требования 8.1**

**Свойство 11: Индикаторы загрузки появляются во время асинхронных операций**
*Для любого* ожидающего API запроса, UI должен отображать индикатор загрузки (спиннер, скелетон или деактивированное состояние) до завершения запроса.
**Валидирует: Требования 9.2**

### Пагинация

**Свойство 12: Пагинация отображает корректные элементы на странице**
*Для любого* пагинированного списка с номером страницы N и размером страницы S, отображаемые элементы должны быть элементами[(N-1)×S] через элементы[N×S-1] из полного набора данных.
**Валидирует: Требования 10.1**

**Свойство 13: Пагинация сохраняет фильтры при смене страниц**
*Для любого* отфильтрованного и пагинированного списка, изменение номера страницы должно сохранять те же критерии фильтрации и отображать следующую страницу отфильтрованных результатов.
**Валидирует: Требования 10.8**

### Доступность

**Свойство 14: Фокус модального окна захвачен**
*Для любого* открытого модального окна, нажатие Tab должно циклически перемещать фокус только среди фокусируемых элементов внутри модального окна, никогда не перемещая фокус за его пределы.
**Валидирует: Требования 11.1**

**Свойство 15: Закрытие модального окна возвращает фокус**
*Для любого* модального окна, которое было открыто элементом-триггером, закрытие модального окна должно вернуть фокус клавиатуры на этот элемент-триггер.
**Валидирует: Требования 11.3**

### Оптимистичные обновления

**Свойство 16: Оптимистичные обновления применяются немедленно**
*Для любой* операции создания, обновления или удаления, изменение должно немедленно отразиться в UI до получения ответа от API.
**Валидирует: Требования 13.1**

**Свойство 17: Неудавшиеся оптимистичные обновления откатываются**
*Для любого* оптимистичного обновления, которое терпит неудачу из-за ошибки API, UI должен откатить изменение и восстановить предыдущее состояние данных.
**Валидирует: Требования 13.4**

### Целостность данных

**Свойство 18: Round-trip данных API сохраняет значения**
*Для любой* сущности (транзакция, категория, бюджет), созданной через API, получение этой сущности должно вернуть данные, эквивалентные тем, что были отправлены (игнорируя сгенерированные сервером поля, такие как id, createdAt, updatedAt).
**Валидирует: Требования 14.1**

**Свойство 19: Парсинг дат обрабатывает часовой пояс корректно**
*Для любой* строки даты, полученной от API, ее парсинг должен произвести объект Date, представляющий тот же момент времени, учитывая различия в часовых поясах.
**Валидирует: Требования 14.3**

### Навигация

**Свойство 20: Активная страница подсвечивается в навигации**
*Для любого* текущего пути приложения, соответствующий пункт навигационного меню должен иметь визуальную индикацию активного состояния (например, другой цвет фона или границу).
**Валидирует: Требования 15.5**


## Обработка ошибок

### Обработка ошибок API

**Структура ответа с ошибкой**
```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // Ошибки валидации, специфичные для полей
  statusCode: number;
}
```

**Стратегия обработки ошибок**
1. **Сетевые ошибки**: Отображать сообщение "Не удалось подключиться к серверу"
2. **Ошибки валидации (400)**: Отображать специфичные для полей ошибки в форме
3. **Ошибки аутентификации (401)**: Перенаправлять на страницу входа
4. **Ошибки авторизации (403)**: Отображать сообщение "Доступ запрещен"
5. **Ошибки "Не найдено" (404)**: Отображать сообщение "Ресурс не найден"
6. **Серверные ошибки (500)**: Отображать сообщение "Ошибка сервера, попробуйте позже"

**Паттерны отображения ошибок**
- **Ошибки форм**: Показывать inline под каждым полем красным текстом
- **Глобальные ошибки**: Показывать toast уведомление в верхней части экрана
- **Ошибки загрузки**: Показывать сообщение об ошибке на месте спиннера загрузки
- **Механизм повтора**: Предоставлять кнопку "Повторить" для неудавшихся запросов

### Валидация форм

**Правила клиентской валидации**

Форма транзакции:
- Сумма: Обязательна, должна быть > 0, максимум 2 десятичных знака
- Категория: Обязательна, должна быть валидным ID категории
- Описание: Обязательно, максимум 500 символов
- Дата: Обязательна, должна быть валидной датой, не в будущем
- Тип: Обязателен, должен быть 'income' или 'expense'

Форма категории:
- Название: Обязательно, 1-50 символов, уникально в рамках типа
- Тип: Обязателен, должен быть 'income' или 'expense'
- Цвет: Обязателен, должен быть валидным hex цветом (#RRGGBB)
- Иконка: Опционально, максимум 50 символов

Форма бюджета:
- Категория: Обязательна, должна быть валидным ID категории
- Сумма: Обязательна, должна быть > 0, максимум 2 десятичных знака
- Период: Обязателен, должен быть 'monthly' или 'yearly'
- Дата начала: Обязательна, должна быть валидной датой
- Дата окончания: Обязательна, должна быть валидной датой, должна быть после даты начала

**Тайминг валидации**
- **On Blur**: Валидировать отдельное поле, когда пользователь покидает его
- **On Submit**: Валидировать все поля перед отправкой
- **Real-time**: Валидировать по мере ввода для критичных полей (сумма, дата)

### Состояния загрузки

**Индикаторы загрузки**
- **Начальная загрузка**: Полноэкранный спиннер с логотипом приложения
- **Загрузка данных**: Скелетоны для списков и карточек
- **Отправка формы**: Деактивированная кнопка со спиннером
- **Inline действия**: Спиннер, заменяющий кнопку действия

**Оптимистичные обновления**
Для лучшего UX, реализовать оптимистичные обновления для:
- Создания транзакций (добавлять в список немедленно)
- Удаления элементов (удалять из списка немедленно)
- Обновления элементов (обновлять в списке немедленно)

Если вызов API терпит неудачу, откатить оптимистичное обновление и показать ошибку.


## Стратегия тестирования

### Двойной подход к тестированию

Frontend будет использовать как unit тесты, так и property-based тесты для комплексного покрытия:

**Unit тесты**: Проверяют конкретные примеры, граничные случаи и условия ошибок
- Рендеринг компонентов с конкретными props
- Потоки взаимодействия пользователя (клик, ввод, отправка)
- Граничные случаи (пустые списки, null значения, граничные условия)
- Состояния ошибок и обработка ошибок
- Интеграция между компонентами

**Property-based тесты**: Проверяют универсальные свойства на всех входных данных
- Валидация форм со случайно сгенерированными невалидными входными данными
- Фильтрация данных со случайными наборами данных и комбинациями фильтров
- Функции форматирования со случайными числовыми значениями и датами
- Точность расчетов со случайными суммами и процентами
- Целостность данных со случайными данными сущностей

Оба подхода дополняют друг друга и необходимы для комплексного покрытия. Unit тесты ловят конкретные баги в специфичных сценариях, в то время как property тесты проверяют общую корректность на широком диапазоне входных данных.

### Инструменты тестирования

**Unit тестирование**
- **Фреймворк**: Jest
- **Тестирование компонентов**: React Testing Library
- **Мокирование**: MSW (Mock Service Worker) для мокирования API
- **Цель покрытия**: 80% покрытия кода

**Property-based тестирование**
- **Библиотека**: fast-check (библиотека property-based тестирования для JavaScript/TypeScript)
- **Конфигурация**: Минимум 100 итераций на property тест
- **Тегирование**: Каждый тест помечен именем фичи и номером свойства

**Пример тега property теста**:
```typescript
// Feature: frontend-implementation, Property 6: Денежные суммы форматируются консистентно
test('форматирование валюты консистентно', () => {
  fc.assert(
    fc.property(fc.float({ min: 0, max: 1000000 }), (amount) => {
      const formatted = formatCurrency(amount, 'USD');
      expect(formatted).toMatch(/^\$[\d,]+\.\d{2}$/);
    }),
    { numRuns: 100 }
  );
});
```

### Организация тестов

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # Unit тесты
│   │   └── Button.properties.test.tsx # Property тесты
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionForm.test.tsx
│   │   └── TransactionForm.properties.test.tsx
├── lib/
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── formatCurrency.test.ts
│   │   └── formatCurrency.properties.test.ts
│   ├── api/
│   │   ├── transactions.ts
│   │   └── transactions.test.ts
```


### Реализация property тестов

Каждое свойство корректности из документа проектирования должно быть реализовано как property-based тест:

**Свойство 1: Валидная отправка формы создает сущность**
```typescript
// Feature: frontend-implementation, Property 1: Валидная отправка формы создает сущность
test('валидная отправка формы создает сущность', () => {
  fc.assert(
    fc.property(
      fc.record({
        type: fc.constantFrom('income', 'expense'),
        amount: fc.float({ min: 0.01, max: 1000000, noNaN: true }),
        categoryId: fc.uuid(),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        date: fc.date({ max: new Date() }).map(d => d.toISOString().split('T')[0])
      }),
      async (formData) => {
        const { result } = renderHook(() => useTransactions());
        await act(async () => {
          await result.current.createTransaction(formData);
        });
        const created = result.current.transactions.find(
          t => t.description === formData.description
        );
        expect(created).toBeDefined();
        expect(created?.amount).toBe(formData.amount);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Свойство 6: Денежные суммы форматируются консистентно**
```typescript
// Feature: frontend-implementation, Property 6: Денежные суммы форматируются консистентно
test('форматирование валюты консистентно', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 1000000, noNaN: true }),
      (amount) => {
        const formatted = formatCurrency(amount, 'USD');
        // Должно соответствовать формату: $X,XXX.XX
        expect(formatted).toMatch(/^\$[\d,]+\.\d{2}$/);
        // Должно иметь ровно 2 десятичных знака
        const decimals = formatted.split('.')[1];
        expect(decimals).toHaveLength(2);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Свойство 12: Пагинация отображает корректные элементы**
```typescript
// Feature: frontend-implementation, Property 12: Пагинация отображает корректные элементы
test('пагинация отображает корректные элементы', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ id: fc.uuid(), name: fc.string() }), { minLength: 10, maxLength: 100 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 5, max: 20 }),
      (items, page, pageSize) => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const expected = items.slice(startIndex, endIndex);
        
        const { result } = renderHook(() => usePagination(items, pageSize));
        act(() => {
          result.current.goToPage(page);
        });
        
        expect(result.current.currentItems).toEqual(expected);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Покрытие unit тестами

**Тесты компонентов**
- Рендеринг с различными комбинациями props
- Взаимодействия пользователя (клики, ввод в формы, навигация с клавиатуры)
- Условный рендеринг на основе состояния
- Error boundaries и состояния ошибок
- Атрибуты доступности (ARIA labels, roles)

**Интеграционные тесты**
- Полные пользовательские потоки (создание транзакции, редактирование категории, удаление бюджета)
- Навигация между страницами
- Сохранение состояния при навигации
- Интеграция с API с мокированными ответами

**Тесты утилитарных функций**
- Граничные случаи (null, undefined, пустые строки)
- Граничные значения (0, отрицательные числа, очень большие числа)
- Невалидные входные данные (неправильно отформатированные даты, невалидные форматы)
- Конкретные примеры из требований

### Непрерывная интеграция

**Pre-commit хуки**
- Запуск линтера (ESLint)
- Запуск проверки типов (TypeScript)
- Запуск unit тестов для измененных файлов

**CI Pipeline**
- Запуск всех unit тестов
- Запуск всех property тестов
- Генерация отчета о покрытии
- Сборка production бандла
- Запуск тестов доступности (axe-core)

**Критерии качества**
- Все тесты должны проходить
- Покрытие кода ≥ 80%
- Нет ошибок TypeScript
- Нет ошибок ESLint
- Размер бандла в пределах лимитов

