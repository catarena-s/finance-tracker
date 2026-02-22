# Руководство администратора Finance Tracker

Этот документ содержит инструкции по администрированию и настройке приложения Finance Tracker.

## Содержание

- [Настройки приложения](#настройки-приложения)
- [Управление фоновыми задачами](#управление-фоновыми-задачами)
- [Повторяющиеся транзакции](#повторяющиеся-транзакции)
- [Мониторинг и логи](#мониторинг-и-логи)

---

## Настройки приложения

Приложение использует таблицу `app_settings` в базе данных для хранения конфигурационных параметров.

### Доступные настройки

| Ключ | Описание | Значение по умолчанию | Диапазон |
|------|----------|----------------------|----------|
| `recurring_task_hour` | Час запуска задачи создания повторяющихся транзакций (UTC) | `0` | 0-23 |
| `recurring_task_minute` | Минута запуска задачи создания повторяющихся транзакций | `0` | 0-59 |

### API для управления настройками

#### Получить все настройки

```bash
curl http://localhost:8000/api/v1/settings/
```

**Ответ:**
```json
[
  {
    "key": "recurring_task_hour",
    "value": "0",
    "description": "Час запуска задачи создания повторяющихся транзакций (UTC, 0-23)",
    "created_at": "2026-02-22T09:24:09.050027+00:00",
    "updated_at": "2026-02-22T09:24:09.050027+00:00"
  },
  {
    "key": "recurring_task_minute",
    "value": "0",
    "description": "Минута запуска задачи создания повторяющихся транзакций (0-59)",
    "created_at": "2026-02-22T09:24:09.050027+00:00",
    "updated_at": "2026-02-22T09:24:09.050027+00:00"
  }
]
```

#### Получить конкретную настройку

```bash
curl http://localhost:8000/api/v1/settings/recurring_task_hour
```

#### Обновить настройку

```bash
curl -X PUT http://localhost:8000/api/v1/settings/recurring_task_hour \
  -H "Content-Type: application/json" \
  -d '{"value": "12"}'
```

**PowerShell:**
```powershell
Invoke-WebRequest -Method PUT -Uri http://localhost:8000/api/v1/settings/recurring_task_hour `
  -Body '{"value":"12"}' -ContentType "application/json" -UseBasicParsing
```

### Применение изменений

⚠️ **Важно:** После изменения настроек времени запуска задач необходимо перезапустить Celery Beat:

```bash
docker-compose restart celery-beat
```

Celery Beat читает настройки из БД только при старте, поэтому для применения изменений требуется перезапуск.

---

## Управление фоновыми задачами

Приложение использует Celery для выполнения фоновых задач.

### Запланированные задачи

| Задача | Описание | Расписание | Настраивается |
|--------|----------|------------|---------------|
| `create-recurring-transactions` | Создание повторяющихся транзакций | Из БД (по умолчанию 00:00 UTC) | ✅ Да |
| `update-exchange-rates` | Обновление курсов валют | 01:00 UTC | ❌ Нет |

### Принудительный запуск задач

Для тестирования или срочного выполнения задач можно использовать административный API.

#### Запустить создание повторяющихся транзакций

```bash
curl -X POST http://localhost:8000/api/v1/admin/tasks/run-recurring
```

**PowerShell:**
```powershell
Invoke-WebRequest -Method POST -Uri http://localhost:8000/api/v1/admin/tasks/run-recurring -UseBasicParsing
```

**Ответ:**
```json
{
  "status": "completed",
  "date": "2026-02-22",
  "created_count": 5,
  "error_count": 0,
  "errors": []
}
```

#### Запустить для конкретной даты

```bash
curl -X POST "http://localhost:8000/api/v1/admin/tasks/run-recurring?target_date=2026-02-20"
```

**PowerShell:**
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:8000/api/v1/admin/tasks/run-recurring?target_date=2026-02-20" -UseBasicParsing
```

---

## Повторяющиеся транзакции

### Как работают повторяющиеся транзакции

1. Пользователь создает шаблон повторяющейся транзакции через UI или API
2. Шаблон сохраняется в таблице `recurring_transactions` с полем `next_occurrence`
3. Celery Beat запускает задачу в настроенное время (по умолчанию 00:00 UTC)
4. Задача проверяет все активные шаблоны, у которых `next_occurrence <= текущая_дата`
5. Для каждого подходящего шаблона создается новая транзакция
6. Поле `next_occurrence` обновляется на следующую дату согласно частоте

### Частоты повторения

- **daily** - ежедневно
- **weekly** - еженедельно
- **monthly** - ежемесячно
- **yearly** - ежегодно

### Проверка шаблонов

Просмотреть все активные шаблоны:

```bash
curl http://localhost:8000/api/v1/recurring-transactions/
```

### Отладка

Если транзакции не создаются автоматически:

1. Проверьте логи Celery Beat:
   ```bash
   docker-compose logs celery-beat --tail=50
   ```

2. Проверьте логи Celery Worker:
   ```bash
   docker-compose logs celery-worker --tail=50
   ```

3. Проверьте настройки времени запуска:
   ```bash
   curl http://localhost:8000/api/v1/settings/
   ```

4. Запустите задачу принудительно для проверки:
   ```bash
   curl -X POST http://localhost:8000/api/v1/admin/tasks/run-recurring
   ```

---

## Мониторинг и логи

### Просмотр логов контейнеров

```bash
# Все логи
docker-compose logs

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs celery-beat
docker-compose logs celery-worker
docker-compose logs database

# Последние N строк
docker-compose logs backend --tail=100

# Следить за логами в реальном времени
docker-compose logs -f backend
```

### Проверка статуса контейнеров

```bash
docker-compose ps
```

### Подключение к базе данных

```bash
docker-compose exec database psql -U postgres -d finance_tracker
```

Полезные SQL запросы:

```sql
-- Проверить настройки
SELECT * FROM app_settings;

-- Проверить активные шаблоны повторяющихся транзакций
SELECT * FROM recurring_transactions WHERE is_active = true;

-- Проверить последние созданные транзакции
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

-- Проверить результаты фоновых задач
SELECT * FROM task_results ORDER BY created_at DESC LIMIT 10;
```

### Перезапуск сервисов

```bash
# Перезапустить все сервисы
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart backend
docker-compose restart celery-beat

# Пересобрать и перезапустить (после изменения кода)
docker-compose up -d --build
```

---

## Настройка времени запуска задач

### Пример: Изменить время запуска на 12:30 UTC

1. **Обновить настройки через API:**

   ```bash
   # Установить час
   curl -X PUT http://localhost:8000/api/v1/settings/recurring_task_hour \
     -H "Content-Type: application/json" \
     -d '{"value": "12"}'

   # Установить минуту
   curl -X PUT http://localhost:8000/api/v1/settings/recurring_task_minute \
     -H "Content-Type: application/json" \
     -d '{"value": "30"}'
   ```

2. **Перезапустить Celery Beat:**

   ```bash
   docker-compose restart celery-beat
   ```

3. **Проверить логи:**

   ```bash
   docker-compose logs celery-beat --tail=20
   ```

   Вы должны увидеть сообщение о загрузке расписания с новым временем.

4. **Протестировать принудительным запуском:**

   ```bash
   curl -X POST http://localhost:8000/api/v1/admin/tasks/run-recurring
   ```

### Пример: PowerShell (Windows)

```powershell
# Обновить настройки
Invoke-WebRequest -Method PUT -Uri http://localhost:8000/api/v1/settings/recurring_task_hour `
  -Body '{"value":"12"}' -ContentType "application/json" -UseBasicParsing

Invoke-WebRequest -Method PUT -Uri http://localhost:8000/api/v1/settings/recurring_task_minute `
  -Body '{"value":"30"}' -ContentType "application/json" -UseBasicParsing

# Перезапустить Celery Beat
docker-compose restart celery-beat

# Проверить
Invoke-WebRequest -Method POST -Uri http://localhost:8000/api/v1/admin/tasks/run-recurring -UseBasicParsing
```

---

## Swagger UI

Для интерактивного тестирования API откройте:

**http://localhost:8000/docs**

Там вы найдете все доступные эндпоинты с возможностью их тестирования прямо в браузере.

---

## Поддержка

При возникновении проблем:

1. Проверьте логи контейнеров
2. Убедитесь, что все контейнеры запущены (`docker-compose ps`)
3. Проверьте настройки в БД
4. Используйте административный API для отладки
5. Обратитесь к [CHANGELOG.md](../CHANGELOG.md) для информации о последних изменениях
