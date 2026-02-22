# Быстрый старт Finance Tracker

Этот гайд поможет быстро запустить проект и проверить его работоспособность.

## Предварительные требования

- Docker и Docker Compose установлены
- Порты 3000, 8000, 5433 свободны

## Шаг 1: Запуск контейнеров

```bash
docker-compose up -d
```

Подождите ~30 секунд, пока все контейнеры запустятся. Миграции и seed данные применяются автоматически при первом запуске backend контейнера.

## Шаг 2: Инициализация базы данных

При первом запуске миграции применяются автоматически. Если нужно применить их вручную:

```bash
docker exec finance-tracker-backend alembic upgrade head
```

Миграции автоматически:
- Создают структуру БД
- Добавляют 14 категорий (доходы и расходы)
- Загружают 190+ тестовых транзакций за 6 месяцев
- Создают 3 бюджета

Проверить количество транзакций:
```bash
docker exec finance-tracker-db psql -U postgres -d finance_tracker -c "SELECT COUNT(*) FROM transactions;"
```

## Шаг 3: Проверка работоспособности

### Проверка данных

Проверьте, что транзакции загружены:
```bash
docker exec finance-tracker-db psql -U postgres -d finance_tracker -c "SELECT COUNT(*) FROM transactions;"
```

Должно быть ~190 транзакций.

Проверьте категории:
```bash
docker exec finance-tracker-db psql -U postgres -d finance_tracker -c "SELECT name, type FROM categories ORDER BY type, name;"
```

### Backend API

1. **Swagger UI**: http://localhost:8000/docs
2. **ReDoc**: http://localhost:8000/redoc
3. **Health check**: http://localhost:8000/health

### Тестовые запросы

```bash
# Проверка здоровья API
curl http://localhost:8000/health

# Получить все категории
curl http://localhost:8000/api/v1/categories

# Получить транзакции
curl http://localhost:8000/api/v1/transactions

# Получить бюджеты
curl http://localhost:8000/api/v1/budgets

# Получить аналитику
curl http://localhost:8000/api/v1/analytics/summary
```

### Frontend

Frontend пока в разработке. Доступен по адресу: http://localhost:3000

## Шаг 4: Остановка

```bash
docker-compose down
```

Для полной очистки (включая данные БД):
```bash
docker-compose down -v
```

## Автоматический скрипт инициализации

Для Windows создан `init.bat`, для Linux/Mac - `init.sh`.

### Windows:
```bash
init.bat
```

### Linux/Mac:
```bash
chmod +x init.sh
./init.sh
```

## Что дальше?

- Изучите API документацию в Swagger UI
- Попробуйте создать транзакцию через API
- Проверьте работу фильтров и пагинации
- Посмотрите аналитику по категориям

## Troubleshooting

### Порт уже занят
Если порт 8000, 3000 или 5433 занят, измените в `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Вместо 8000:8000
  - "5434:5432"  # Вместо 5433:5432
```

### База данных не инициализируется
Проверьте логи:
```bash
docker-compose logs backend
docker-compose logs database
```

### Контейнер backend падает
Убедитесь, что база данных запустилась:
```bash
docker-compose ps
```

Все сервисы должны быть в статусе "Up".
