# Changelog

Все важные изменения в проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).

## 0.0.1 - 2026-02-14

### Добавлено
- Создана архитектурная документация (ARCHITECTURE.md)
- Создан шаблон отчёта (REPORT.md)
- Настроен Docker Compose для frontend, backend и database
- Созданы Dockerfile для frontend (Next.js) и backend (FastAPI)
- Настроен CI/CD pipeline (GitHub Actions)
  - ci-feature.yml для линтинга в feature ветках
  - ci-pr.yml для тестов и сборки Docker образов в PR
- Инициализирован Next.js проект с TypeScript
- Настроен Tailwind CSS для frontend
- Создана структура директорий frontend (components, hooks, services, utils, types, styles)
- Инициализирован FastAPI проект
- Создана структура директорий backend (api/routes, services, models, schemas, repositories, core)
- Настроен SQLAlchemy с async поддержкой
- Настроен Alembic для миграций БД
- Созданы seed данные (12 категорий, транзакции, 3 бюджета)
- Создан скрипт загрузки seed данных (load_seeds.py)

## 0.0.0 - 2026-02-14

- Создан проект
- Добавлена базовая структура директорий (frontend, backend, database)
- Создана документация (README.md, CHANGELOG.md)
- Настроен .gitignore для Node.js, Python и Docker
