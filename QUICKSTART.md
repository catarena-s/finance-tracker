# Быстрый старт Finance Tracker

Этот гайд поможет быстро запустить проект и проверить его работоспособность.

## Предварительные требования

- Docker и Docker Compose установлены
- Порты 3000, 8000, 5432 свободны

## Шаг 1: Запуск контейнеров

```bash
docker-compose up -d
```

Подождите ~30 секунд, пока все контейнеры запустятся.

## Шаг 2: Инициализация базы данных

### Применить миграции

```bash
docker-compose exec backend alembic upgrade head
```

Вы должны увидеть:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 20260214185500, initial_schema
INFO  [alembic.runtime.migration] Running upgrade 20260214185500 -> 20260214200000, add_is_recurring_field
```

### Загрузить тестовые данные

```bash
docker-compose exec backend python ../database/seeds/load_seeds.py
```

Вы должны увидеть:
```
✓ Загружено 12 категорий
✓ Загружено 200+ транзакций
✓ Загружено 3 бюджета
```

## Шаг 3: Проверка работоспособности

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
Если порт 8000 или 3000 занят, измените в `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Вместо 8000:8000
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
